import { NavLink, useMatch } from "react-router-dom"
import { getProjectNav, routes, workspaceNav } from "../../utils/navigation"
import Logo from "../../assets/logo.svg"
import { useAuth } from "../../contexts/AuthContext"
import AuthService from "../../services/AuthService"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2"

type AppSidebarProps = {
  mode: "workspace" | "project"
  open: boolean
  onClose: () => void
  onOpen: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-neutral-400 hover:bg-white/5 hover:text-white",
  ].join(" ")

const AppSidebar = ({ mode, open, onClose, onOpen }: AppSidebarProps) => {
  const projectMatch = useMatch({ path: "/projects/:projectId", end: false })
  const projectId = projectMatch?.params.projectId ?? ""
  const { user, refresh } = useAuth()
  const items = mode === "project" ? getProjectNav(projectId) : workspaceNav

  const handleLogout = async () => {
    await AuthService.signout()
    await refresh()
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={onOpen}
          className="grid size-10 place-content-center rounded-lg text-accent hover:bg-neutral-100"
          aria-label="Open navigation"
        >
          <HiOutlineBars3 className="size-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src={Logo} alt="" className="h-6 invert" />
          <span className="font-semibold text-accent">Ainvoker</span>
        </div>
        <div className="size-10" aria-hidden />
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-accent text-white transition-transform duration-300 ease-out md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-14 items-center justify-between px-5 md:h-16">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <img src={Logo} alt="AInvoker" className="h-7" />
            <span className="text-lg font-semibold tracking-tight">Ainvoker</span>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <WorkspaceSwitcher />
        </div>

        <div className="px-5 pb-3">
          {mode === "project" ? (
            <NavLink
              to={routes.dashboard}
              onClick={onClose}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-white"
            >
              <HiOutlineArrowLeft className="size-3.5" aria-hidden />
              Back to workspace
            </NavLink>
          ) : null}
          <p className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase">
            {mode === "project" ? "Project" : "Workspace"}
          </p>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3"
          aria-label={mode === "project" ? "Project" : "Workspace"}
        >
          {items.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={linkClass}
            >
              <Icon className="size-5 shrink-0 opacity-80" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 truncate px-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || "Account"}
            </p>
            <p className="truncate text-xs text-neutral-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <HiOutlineArrowRightOnRectangle className="size-5" aria-hidden />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
