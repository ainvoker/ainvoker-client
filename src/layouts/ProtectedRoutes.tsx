import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoutes = () => {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="grid min-h-screen place-content-center bg-[#f4f4f5] text-sm text-neutral-500">
                Loading workspace…
            </div>
        )
    }

    if (!user) return <Navigate to="/" replace />
    if (!user.emailVerified) return <Navigate to="/verify-email" replace />

    return <Outlet />
}

export default ProtectedRoutes
