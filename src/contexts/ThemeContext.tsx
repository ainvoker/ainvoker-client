import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import UserService, { type ThemePreference } from "../services/UserService"
import { useAuth } from "./AuthContext"

const STORAGE_KEY = "ainvoker-theme-preference"

type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
    themePreference: ThemePreference
    resolvedTheme: ResolvedTheme
    setThemePreference: (preference: ThemePreference) => Promise<void>
    isSaving: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
    themePreference: "DEVICE",
    resolvedTheme: "light",
    setThemePreference: async () => {},
    isSaving: false,
})

export const useTheme = () => useContext(ThemeContext)

function isThemePreference(value: unknown): value is ThemePreference {
    return value === "LIGHT" || value === "DARK" || value === "DEVICE"
}

function readStoredPreference(): ThemePreference {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (isThemePreference(raw)) return raw
    } catch {
        // ignore
    }
    return "DEVICE"
}

function writeStoredPreference(preference: ThemePreference) {
    try {
        localStorage.setItem(STORAGE_KEY, preference)
    } catch {
        // ignore
    }
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference === "LIGHT") return "light"
    if (preference === "DARK") return "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
}

/** Theme is scoped to the workspace shell — never toggle documentElement. */
function clearDocumentTheme() {
    document.documentElement.classList.remove("dark")
    document.documentElement.style.removeProperty("color-scheme")
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { token, appBootstrap, patchAppUser } = useAuth()
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() =>
        typeof window === "undefined" ? "DEVICE" : readStoredPreference(),
    )
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
        typeof window === "undefined" ? "light" : resolveTheme(readStoredPreference()),
    )
    const [isSaving, setIsSaving] = useState(false)

    const syncResolved = useCallback((preference: ThemePreference) => {
        setResolvedTheme(resolveTheme(preference))
    }, [])

    useEffect(() => {
        clearDocumentTheme()
    }, [])

    useEffect(() => {
        syncResolved(themePreference)
    }, [themePreference, syncResolved])

    useEffect(() => {
        if (themePreference !== "DEVICE") return

        const media = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => syncResolved("DEVICE")
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
    }, [themePreference, syncResolved])

    useEffect(() => {
        const fromServer = appBootstrap?.user.themePreference
        if (!isThemePreference(fromServer)) return
        setThemePreferenceState(fromServer)
        writeStoredPreference(fromServer)
    }, [appBootstrap?.user.themePreference])

    const setThemePreference = useCallback(
        async (preference: ThemePreference) => {
            setThemePreferenceState(preference)
            writeStoredPreference(preference)
            syncResolved(preference)

            if (!token) return

            setIsSaving(true)
            const [updated, err] = await UserService.updateProfile(token, {
                themePreference: preference,
            })
            setIsSaving(false)

            if (err || !updated) {
                console.error("Failed to save theme preference:", err)
                return
            }

            setThemePreferenceState(updated.themePreference)
            writeStoredPreference(updated.themePreference)
            patchAppUser(updated)
        },
        [token, syncResolved, patchAppUser],
    )

    return (
        <ThemeContext.Provider
            value={{
                themePreference,
                resolvedTheme,
                setThemePreference,
                isSaving,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
