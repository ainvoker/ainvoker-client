export default class Service {
    
    async handle<T>(fn: () => Promise<T>): Promise<[T | null, string | undefined]> {
        try {
            const res = await fn()
    
            return [res, undefined]
        } catch (err) {
            return [null,  err instanceof Error ? err.message : "Unknown error"]
        }
    }

    async request<T = unknown>(uri: string, options?: RequestInit): Promise<[T | null, string | undefined]> {
        return this.handle<T>(async () => {
            const res = await fetch(uri, options)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            return data
        })
    }

}