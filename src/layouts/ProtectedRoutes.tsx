import { Navigate, Outlet } from "react-router-dom"
import PageLoader from "../components/common/PageLoader"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoutes = () => {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <PageLoader fullScreen label="Loading workspace…" />
    }

    if (!user) return <Navigate to="/" replace />
    if (!user.emailVerified) return <Navigate to="/verify-email" replace />

    return <Outlet />
}

export default ProtectedRoutes
