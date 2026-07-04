import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function GuestRoutes() {
    const { user, isLoading } = useAuth()

    if (user && !isLoading && !user.emailVerified) return <Navigate to="/verify-email" replace />
    if (user && user.emailVerified) return <Navigate to="/" replace />

    return <Outlet />
}