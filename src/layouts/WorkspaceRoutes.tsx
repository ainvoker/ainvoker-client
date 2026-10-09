import { Navigate, useLocation } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"
import PageLoader from "../components/common/PageLoader"
import { useAuth } from "../contexts/AuthContext"
import Landing from "../pages/Landing"
import {
  clearPersistedInviteNext,
  loginPathWithNext,
  persistInviteNext,
  readPersistedInviteNext,
  verifyEmailPathWithNext,
} from "../utils/inviteRedirect"
import WorkspaceLayout from "./WorkspaceLayout"

/**
 * Gate for the authenticated app shell, including `/`.
 * One layout route keeps the sidebar mounted between the dashboard and other pages.
 * Guests on `/` get the landing page instead of a login redirect.
 */
const WorkspaceRoutes = () => {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === "/"

  if (isLoading) {
    return <PageLoader fullScreen label="Loading workspace…" />
  }

  if (!user) {
    if (isHome) return <Landing />
    const next = `${location.pathname}${location.search}`
    if (next.startsWith("/invites/accept")) {
      persistInviteNext(next)
      return <Navigate to={loginPathWithNext(next)} replace />
    }
    return <Navigate to="/" replace />
  }

  if (!user.emailVerified) {
    if (isHome) {
      return (
        <Navigate to={verifyEmailPathWithNext(readPersistedInviteNext())} replace />
      )
    }
    return <Navigate to="/verify-email" replace />
  }

  if (isHome) {
    const pendingInvite = readPersistedInviteNext()
    if (pendingInvite) {
      clearPersistedInviteNext()
      return <Navigate to={pendingInvite} replace />
    }
  }

  return (
    <RouteErrorBoundary fullScreen>
      <WorkspaceLayout />
    </RouteErrorBoundary>
  )
}

export default WorkspaceRoutes
