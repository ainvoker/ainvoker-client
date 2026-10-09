import { Navigate, Outlet, useSearchParams } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import { useAuth } from "../contexts/AuthContext"
import {
    clearPersistedInviteNext,
    persistInviteNext,
    resolveInviteNext,
    verifyEmailPathWithNext,
} from "../utils/inviteRedirect"

export default function GuestRoutes() {
    const { user, isLoading } = useAuth()
    const [searchParams] = useSearchParams()

    const inviteNext = resolveInviteNext(searchParams.get("next"))
    if (inviteNext) {
        persistInviteNext(inviteNext)
    }

    if (user && !isLoading && !user.emailVerified) {
        return (
            <Navigate to={verifyEmailPathWithNext(inviteNext)} replace />
        )
    }

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
