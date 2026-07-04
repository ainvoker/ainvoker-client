import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoutes = () => {
    const { user, isLoading } = useAuth()

    if (!user && !isLoading) return <Navigate to={'/'} replace />
    if (user && !user.emailVerified) return <Navigate to={'/verify-email'} replace />

    return (
        <Outlet />
    )
}

export default ProtectedRoutes