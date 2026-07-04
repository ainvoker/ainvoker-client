import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import AuthService from "../services/AuthService";
import type { User } from "@neondatabase/neon-js/auth/types";

const AuthContext = createContext<{ 
    user: User | null,
    token: string | null,
    otp: string | null,
    setVerificationCode: (otp: string | null) => void,
    setAuth: (data: User | undefined) => void,
    isLoading: boolean, 
    error: string | null, 
    refresh: () => Promise<void> 
}>({
    user: null,
    token: null,
    otp: "",
    setVerificationCode: () => {},
    setAuth: () => {},
    isLoading: true,
    error: null,
    refresh: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState<string | null>(null)

    const fetchAuthUser = useCallback(async () => {
        setLoading(true)

        const [data, err] = await AuthService.getAuthUser()

        console.log(data, err)
        if(err) {
            setError(err)
        }

        if(!data) {
            setUser(null)
        }

        if(data) {
            setToken(data.session.token)
            setUser(data.user)
            setError(null)
        }

        setLoading(false)
    }, [])

    const setAuth = (data: User | undefined) => {
        setUser(data ?? null)
    }

    const setVerificationCode = (otp: string | null) => {
        setOtp(otp)
    }

    useEffect(() => {
        fetchAuthUser()
    }, [])

    console.log(user)

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                otp,
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