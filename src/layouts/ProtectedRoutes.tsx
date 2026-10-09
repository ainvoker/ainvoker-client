import { Navigate, Outlet, useLocation } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import PageLoader from "../components/common/PageLoader"
import { useAuth } from "../contexts/AuthContext"
import { loginPathWithNext, persistInviteNext } from "../utils/inviteRedirect"

const ProtectedRoutes = () => {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <PageLoader fullScreen label="Loading workspace…" />
    }

    if (!user) {
        const next = `${location.pathname}${location.search}`
        if (next.startsWith("/invites/accept")) {
            persistInviteNext(next)
            return <Navigate to={loginPathWithNext(next)} replace />
        }
        return <Navigate to="/" replace />
    }
    if (!user.emailVerified) return <Navigate to="/verify-email" replace />

    return (
        <RouteErrorBoundary fullScreen>
            <Outlet />
        </RouteErrorBoundary>
    )
}

export default ProtectedRoutes
