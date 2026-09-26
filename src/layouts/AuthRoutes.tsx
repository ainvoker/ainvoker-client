import { Navigate, Outlet } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import { useAuth } from "../contexts/AuthContext"

const AuthRoutes = () => {
    const { user, isLoading } = useAuth()

    if (!user && !isLoading) return <Navigate to={'/login'} replace />
    if (user && user.emailVerified) return <Navigate to={'/'} replace />

    return (
        <RouteErrorBoundary fullScreen>
            <Outlet />
        </RouteErrorBoundary>
    )
}

export default AuthRoutes