import { Navigate, Outlet, useSearchParams } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import { useAuth } from "../contexts/AuthContext"

function safeInviteNext(raw: string | null): string | null {
    if (!raw) return null
    try {
        const decoded = decodeURIComponent(raw)
        if (decoded.startsWith("/invites/accept")) return decoded
    } catch {
        // ignore
    }
    return null
}

export default function GuestRoutes() {
    const { user, isLoading } = useAuth()
    const [searchParams] = useSearchParams()

    if (user && !isLoading && !user.emailVerified) return <Navigate to="/verify-email" replace />
    if (user && user.emailVerified) {
        const next = safeInviteNext(searchParams.get("next"))
        return <Navigate to={next ?? "/"} replace />
    }

    return (
        <RouteErrorBoundary fullScreen>
            <Outlet />
        </RouteErrorBoundary>
    )
}
