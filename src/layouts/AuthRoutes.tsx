import { Navigate, Outlet, useSearchParams } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import { useAuth } from "../contexts/AuthContext"
import {
    clearPersistedInviteNext,
    persistInviteNext,
    resolveInviteNext,
} from "../utils/inviteRedirect"

const AuthRoutes = () => {
    const { user, isLoading } = useAuth()
    const [searchParams] = useSearchParams()

    const inviteNext = resolveInviteNext(searchParams.get("next"))
    if (inviteNext) {
        persistInviteNext(inviteNext)
    }

    if (!user && !isLoading) return <Navigate to="/login" replace />

    if (user && !isLoading && user.emailVerified) {
        if (inviteNext) {
            clearPersistedInviteNext()
        }
        return <Navigate to={inviteNext ?? "/"} replace />
    }

    return (
        <RouteErrorBoundary fullScreen>
            <Outlet />
        </RouteErrorBoundary>
    )
}

export default AuthRoutes
