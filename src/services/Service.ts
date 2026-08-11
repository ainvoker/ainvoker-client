import { getFreshAccessToken } from "../utils/auth"

/** Structured API failure from `{ error: { code, message } }` (or legacy string error). */
export type ApiErrorInfo = {
    status: number
    code?: string
    message: string
}

export class ApiRequestError extends Error {
    readonly status: number
    readonly code?: string

    constructor(info: ApiErrorInfo) {
        super(info.message)
        this.name = "ApiRequestError"
        this.status = info.status
        this.code = info.code
    }

    toInfo(): ApiErrorInfo {
        return {
            status: this.status,
            code: this.code,
            message: this.message,
        }
    }
}

/** Parse backend error JSON into status + code + message. */
export function parseApiError(data: unknown, status: number): ApiErrorInfo {
    const body = data as { error?: string | { code?: string; message?: string } } | null

    if (typeof body?.error === "string") {
        return { status, message: body.error }
    }

    if (body?.error && typeof body.error === "object") {
        const code =
            typeof body.error.code === "string" ? body.error.code : undefined
        const message =
            typeof body.error.message === "string"
                ? body.error.message
                : `Request failed (${status})`
        return { status, code, message }
    }

    return { status, message: `Request failed (${status})` }
}

/** Narrow unknown catch values / tuple failures into ApiErrorInfo when possible. */
export function asApiErrorInfo(err: unknown): ApiErrorInfo | undefined {
    if (err instanceof ApiRequestError) return err.toInfo()
    if (
        err &&
        typeof err === "object" &&
        typeof (err as ApiErrorInfo).message === "string" &&
        typeof (err as ApiErrorInfo).status === "number"
    ) {
        return err as ApiErrorInfo
    }
    return undefined
}

export default class Service {
    async handle<T>(fn: () => Promise<T>): Promise<[T | null, string | undefined]> {
        try {
            const res = await fn()
            return [res, undefined]
        } catch (err) {
            return [null, err instanceof Error ? err.message : "Unknown error"]
        }
    }

    private withBearerToken(options: RequestInit | undefined, token: string): RequestInit {
        const headers = new Headers(options?.headers)
        headers.set("Authorization", `Bearer ${token}`)
        return { ...options, headers }
    }

    private async executeFetch(
        uri: string,
        options?: RequestInit,
    ): Promise<{ res: Response; data: unknown }> {
        const execute = async (init?: RequestInit) => {
            const res = await fetch(uri, init)
            const data = await res.json().catch(() => null)
            return { res, data }
        }

        let { res, data } = await execute(options)

        // Neon Auth JWTs expire while the SPA stays open. Refresh once and retry.
        if (res.status === 401) {
            const fresh = await getFreshAccessToken()
            if (fresh) {
                ;({ res, data } = await execute(this.withBearerToken(options, fresh)))
            }
        }

        return { res, data }
    }

    /**
     * Standard tuple used across the app. On failure the second value is the
     * human-readable message only (backward compatible).
     */
    async request<T = unknown>(
        uri: string,
        options?: RequestInit,
    ): Promise<[T | null, string | undefined]> {
        return this.handle<T>(async () => {
            const { res, data } = await this.executeFetch(uri, options)

            if (!res.ok) {
                throw new ApiRequestError(parseApiError(data, res.status))
            }

            return ((data as { data?: T } | null)?.data ?? data) as T
        })
    }

    /**
     * Same as request, but surfaces HTTP status + error.code for upgrade UX
     * and other callers that need to branch on failure type.
     */
    async requestDetailed<T = unknown>(
        uri: string,
        options?: RequestInit,
    ): Promise<[T | null, ApiErrorInfo | undefined]> {
        try {
            const { res, data } = await this.executeFetch(uri, options)

            if (!res.ok) {
                return [null, parseApiError(data, res.status)]
            }

            return [((data as { data?: T } | null)?.data ?? data) as T, undefined]
        } catch (err) {
            if (err instanceof ApiRequestError) return [null, err.toInfo()]
            return [
                null,
                {
                    status: 0,
                    message: err instanceof Error ? err.message : "Unknown error",
                },
            ]
        }
    }
}
