import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Landing from "./Landing"
import Dashboard from "./workspace/Dashboard"
import WorkspaceLayout from "../layouts/WorkspaceLayout"

const Home = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-content-center bg-[#f4f4f5] text-sm text-neutral-500">
        Loading workspace…
      </div>
    )
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
