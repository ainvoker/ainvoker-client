import { Outlet } from "react-router-dom"
import { RouteErrorBoundary } from "../components/common/ErrorBoundary"

/**
 * Project route chrome: padded page outlet.
 * Sidebar nav (including project switcher) is handled by WorkspaceLayout.
 */
const ProjectLayout = () => {
  return (
    <main className="min-w-0 flex-1 overflow-auto bg-neutral-50/80 p-4 md:p-5 lg:p-6 dark:bg-transparent">
      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
    </main>
  )
}

export default ProjectLayout
