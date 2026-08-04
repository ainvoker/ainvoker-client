import { useState } from "react"
import { Outlet, useMatch } from "react-router-dom"
import AppSidebar from "../components/workspace/AppSidebar"

type WorkspaceLayoutProps = {
  children?: React.ReactNode
}

/**
 * Authenticated app shell.
 * Sidebar swaps between workspace and project nav based on the active route.
 * Supports children (Home `/`) or nested Outlet.
 */
const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const projectMatch = useMatch({ path: "/projects/:projectId", end: false })
  const mode = projectMatch ? "project" : "workspace"

  return (
    <div className="flex min-h-screen bg-[#f4f4f5] text-accent">
      <AppSidebar
        mode={mode}
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 100% -10%, rgba(17,17,17,0.06), transparent), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(17,17,17,0.04), transparent)",
          }}
        />
        {children ?? <Outlet />}
      </div>
    </div>
  )
}

export default WorkspaceLayout
