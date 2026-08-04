import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import AuthService from "../services/AuthService";
import UserService, { type AppUser, type BootstrapResult } from "../services/UserService";
import type { User } from "@neondatabase/neon-js/auth/types";
import { clearStoredOrganizationId } from "../utils/workspace";

const AuthContext = createContext<{ 
    user: User | null,
    token: string | null,
    otp: string | null,
    /** App user + memberships from the last successful bootstrap (null until synced). */
    appBootstrap: BootstrapResult | null,
    patchAppUser: (user: AppUser) => void,
    setVerificationCode: (otp: string | null) => void,
    setAuth: (data: User | undefined) => void,
    isLoading: boolean, 
    error: string | null, 
    refresh: () => Promise<void> 
}>({
    user: null,
    token: null,
    otp: "",
    appBootstrap: null,
    patchAppUser: () => {},
    setVerificationCode: () => {},
    setAuth: () => {},
    isLoading: true,
    error: null,
    refresh: async () => {}
})

export const useAuth = () => useContext(AuthContext)

/** Survives React Strict Mode remounts (refs alone do not). */
const bootstrapInFlight = new Map<string, Promise<BootstrapResult | null>>()

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [appBootstrap, setAppBootstrap] = useState<BootstrapResult | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState<string | null>(null)
    const bootstrappedFor = useRef<string | null>(null)

    const syncAppUser = useCallback(async (sessionToken: string, neonUser: User) => {
        const existing = bootstrapInFlight.get(neonUser.id)
        if (existing) {
            const result = await existing
            if (result) setAppBootstrap(result)
            bootstrappedFor.current = neonUser.id
            return
        }

        // Always hydrate appBootstrap from the API (idempotent).
        // Neon name/image are create-time seeds — backend should not overwrite
        // existing profile fields on later calls (needed for edit profile).
        const run = (async () => {
            const [result, syncErr] = await UserService.bootstrap(sessionToken, {
                name: neonUser.name,
                email: neonUser.email,
                image: neonUser.image,
            })

            if (syncErr || !result) {
                console.error("Failed to provision app user:", syncErr)
                return null
            }

            bootstrappedFor.current = neonUser.id
            setAppBootstrap(result)
            return result
        })()

        bootstrapInFlight.set(neonUser.id, run)
        try {
            await run
        } finally {
            bootstrapInFlight.delete(neonUser.id)
        }
    }, [])

    const fetchAuthUser = useCallback(async () => {
        setLoading(true)

        const [data, err] = await AuthService.getAuthUser()

        if (err) {
            setError(err)
        }

        if (!data) {
            setUser(null)
            setToken(null)
            setAppBootstrap(null)
            bootstrappedFor.current = null
            clearStoredOrganizationId()
        }

        if (data) {
            // Neon returns an opaque session token (not a JWT). The API validates it
            // via Neon Auth GET /get-session with Authorization: Bearer <token>.
            setToken(data.session.token)
            setUser(data.user)
            setError(null)
            await syncAppUser(data.session.token, data.user)
        }

        setLoading(false)
    }, [syncAppUser])

    const setAuth = (data: User | undefined) => {
        setUser(data ?? null)
        if (!data) {
            setAppBootstrap(null)
            clearStoredOrganizationId()
        }
    }

    const setVerificationCode = (otp: string | null) => {
        setOtp(otp)
    }

    const patchAppUser = useCallback((user: AppUser) => {
        setAppBootstrap((prev) => (prev ? { ...prev, user } : prev))
    }, [])

    useEffect(() => {
        fetchAuthUser()
    }, [fetchAuthUser])

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                otp,
                appBootstrap,
                patchAppUser,
                setVerificationCode,
                setAuth,
                isLoading: loading,
                error,
                refresh: fetchAuthUser
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
