import { Navigate, Outlet, useLocation } from "react-router-dom"
import PageLoader from "../components/common/PageLoader"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoutes = () => {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <PageLoader fullScreen label="Loading workspace…" />
    }

    if (!user) {
        const next = `${location.pathname}${location.search}`
        const loginPath =
            next.startsWith("/invites/accept")
                ? `/login?next=${encodeURIComponent(next)}`
                : "/"
        return <Navigate to={loginPath} replace />
    }
    if (!user.emailVerified) return <Navigate to="/verify-email" replace />

    return <Outlet />
}

export default ProtectedRoutes
