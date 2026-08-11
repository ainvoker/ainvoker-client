import { createAuthClient } from '@neondatabase/neon-js/auth';

export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_URL);

/** Refresh skew: refresh this many ms before JWT `exp`. */
export const TOKEN_REFRESH_SKEW_MS = 60_000;

type AccessTokenProvider = (options?: { force?: boolean }) => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider | null = null;

/** Wired by AuthProvider so Service can refresh on 401 without React context. */
export function setAccessTokenProvider(provider: AccessTokenProvider | null) {
    accessTokenProvider = provider;
}

/** Always forces a session re-read — used by Service on 401. */
export async function getFreshAccessToken(): Promise<string | null> {
    return accessTokenProvider?.({ force: true }) ?? null;
}

export function looksLikeJwt(token: string): boolean {
    return token.split('.').length === 3;
}

/** JWT `exp` (seconds), or null if not a JWT / unreadable. */
export function getJwtExpiration(token: string): number | null {
    if (!looksLikeJwt(token)) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]!)) as { exp?: unknown };
        return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
        return null;
    }
}

export function isAccessTokenExpiringSoon(
    token: string,
    skewMs: number = TOKEN_REFRESH_SKEW_MS,
): boolean {
    const exp = getJwtExpiration(token);
    if (exp === null) return false;
    return exp * 1000 - Date.now() <= skewMs;
}

export function msUntilAccessTokenRefresh(
    token: string,
    skewMs: number = TOKEN_REFRESH_SKEW_MS,
): number | null {
    const exp = getJwtExpiration(token);
    if (exp === null) return null;
    return Math.max(0, exp * 1000 - Date.now() - skewMs);
}
