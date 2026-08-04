import { Outlet } from "react-router-dom"
import ProjectSwitcher from "../components/workspace/ProjectSwitcher"

/**
 * Project route chrome: top bar with project switcher + page outlet.
 * Sidebar nav is handled by WorkspaceLayout (swapped to project mode).
 */
const ProjectLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:min-h-screen">
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center border-b border-neutral-200/80 bg-[#f4f4f5]/90 px-4 backdrop-blur md:h-14 md:px-5 lg:px-6">
        <ProjectSwitcher />
      </header>

      <main className="min-w-0 flex-1 overflow-auto p-4 md:p-5 lg:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default ProjectLayout
