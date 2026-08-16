import { NavLink, useMatch } from "react-router-dom"
import { getProjectNav, workspaceNav } from "../../utils/navigation"
import Logo from "../../assets/logo.svg"
import ProfileMenu from "./ProfileMenu"
import ProjectSwitcher from "./ProjectSwitcher"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2"

type AppSidebarProps = {
  open: boolean
  onClose: () => void
  onOpen: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
    isActive
      ? "bg-neutral-100 text-accent dark:bg-neutral-800"
      : "text-neutral-500 hover:bg-neutral-50 hover:text-accent dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100",
  ].join(" ")

const AppSidebar = ({ open, onClose, onOpen }: AppSidebarProps) => {
  const projectMatch = useMatch({ path: "/projects/:projectId", end: false })
  const projectId = projectMatch?.params.projectId ?? ""
  const projectItems = projectId ? getProjectNav(projectId) : []

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
        <button
          type="button"
          onClick={onOpen}
          className="grid size-9 place-content-center rounded-md text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation"
        >
          <HiOutlineBars3 className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src={Logo} alt="" className="h-5 invert dark:invert-0" />
          <span className="text-sm font-semibold text-accent">AInvoker</span>
        </div>
        <div className="size-9" aria-hidden />
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-neutral-200/80 bg-white text-accent transition-transform duration-300 ease-out md:static md:h-full md:shrink-0 md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-950",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-12 items-center justify-between px-3 md:h-14">
          <NavLink
            to="/"
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <img src={Logo} alt="AInvoker" className="h-5 invert dark:invert-0" />
            <span className="text-sm font-semibold tracking-tight">AInvoker</span>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-content-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-accent md:hidden dark:hover:bg-neutral-800"
            aria-label="Close navigation"
          >
            <HiOutlineXMark className="size-4" />
          </button>
        </div>

        <div className="px-2 pb-2">
          <WorkspaceSwitcher />
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2">
          <nav className="flex flex-col gap-0.5" aria-label="Workspace">
            <p className="px-2 pb-1 text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
              Workspace
            </p>
            {workspaceNav.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onClose}
                className={linkClass}
              >
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {projectId ? (
            <nav className="flex flex-col gap-0.5" aria-label="Project">
              <ProjectSwitcher onNavigate={onClose} />
              {projectItems.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  onClick={onClose}
                  className={linkClass}
                >
                  <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="mt-auto border-t border-neutral-200/80 p-3 dark:border-neutral-800">
          <ProfileMenu onNavigate={onClose} />
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
