import { Navigate } from "react-router-dom"
import PageLoader from "../components/common/PageLoader"
import { useAuth } from "../contexts/AuthContext"
import Landing from "./Landing"
import Dashboard from "./workspace/Dashboard"
import WorkspaceLayout from "../layouts/WorkspaceLayout"

const Home = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader fullScreen label="Loading workspace…" />
  }

  if (!user) return <Landing />

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return (
    <WorkspaceLayout>
      <Dashboard />
    </WorkspaceLayout>
  )
}

export default Home
