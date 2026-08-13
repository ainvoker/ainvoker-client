import { Outlet } from "react-router-dom"

/**
 * Project route chrome: padded page outlet.
 * Sidebar nav (including project switcher) is handled by WorkspaceLayout.
 */
const ProjectLayout = () => {
  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <Outlet />
    </main>
  )
}

export default ProjectLayout
