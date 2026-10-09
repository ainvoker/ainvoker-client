const INVITE_NEXT_STORAGE_KEY = "ainvoker.pendingInviteNext"

/** Allowed post-auth return paths for organization invites. */
export function safeInviteNext(raw: string | null | undefined): string | null {
    if (!raw) return null
    try {
        const decoded = decodeURIComponent(raw)
        if (decoded.startsWith("/invites/accept")) return decoded
    } catch {
        // ignore
    }
    return null
}

export function persistInviteNext(next: string | null): void {
    if (!next) {
        sessionStorage.removeItem(INVITE_NEXT_STORAGE_KEY)
        return
    }
    sessionStorage.setItem(INVITE_NEXT_STORAGE_KEY, next)
}

export function readPersistedInviteNext(): string | null {
    const stored = sessionStorage.getItem(INVITE_NEXT_STORAGE_KEY)
    return safeInviteNext(stored)
}

export function clearPersistedInviteNext(): void {
    sessionStorage.removeItem(INVITE_NEXT_STORAGE_KEY)
}

/** Prefer query `next`, then sessionStorage (OAuth round-trips). */
export function resolveInviteNext(searchParam: string | null | undefined): string | null {
    return safeInviteNext(searchParam) ?? readPersistedInviteNext()
}

export function withNextQuery(path: string, next: string | null): string {
    if (!next) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}next=${encodeURIComponent(next)}`
}

export function loginPathWithNext(next: string | null): string {
    return withNextQuery("/login", next)
}

export function signupPathWithNext(next: string | null): string {
    return withNextQuery("/signup", next)
}

export function verifyEmailPathWithNext(next: string | null): string {
    return withNextQuery("/verify-email", next)
}

/** OAuth providers need an absolute URL; preserve invite `next` on login/signup. */
export function oauthCallbackURL(pathname: "/login" | "/signup", next: string | null): string {
    const path = pathname === "/login" ? loginPathWithNext(next) : signupPathWithNext(next)
    return `${window.location.origin}${path}`
}
