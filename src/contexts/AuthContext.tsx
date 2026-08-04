import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import AuthService from "../services/AuthService";
import UserService, { type BootstrapResult } from "../services/UserService";
import type { User } from "@neondatabase/neon-js/auth/types";
import { clearStoredOrganizationId } from "../utils/workspace";

const AuthContext = createContext<{ 
    user: User | null,
    token: string | null,
    otp: string | null,
    /** App user + memberships from the last successful bootstrap (null until synced). */
    appBootstrap: BootstrapResult | null,
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
    setVerificationCode: () => {},
    setAuth: () => {},
    isLoading: true,
    error: null,
    refresh: async () => {}
})

export const useAuth = () => useContext(AuthContext)

/** Survives React Strict Mode remounts (refs alone do not). */
const bootstrappedUserIds = new Set<string>()
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
        if (bootstrappedFor.current === neonUser.id || bootstrappedUserIds.has(neonUser.id)) {
            bootstrappedFor.current = neonUser.id
            return
        }

        const existing = bootstrapInFlight.get(neonUser.id)
        if (existing) {
            const result = await existing
            if (result) setAppBootstrap(result)
            bootstrappedFor.current = neonUser.id
            return
        }

        const run = (async () => {
            const [result, syncErr] = await UserService.bootstrap(sessionToken, {
                name: neonUser.name,
                image: neonUser.image,
            })

            if (syncErr || !result) {
                console.error("Failed to provision app user:", syncErr)
                return null
            }

            bootstrappedUserIds.add(neonUser.id)
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
