import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useWorkspace } from "../contexts/WorkspaceContext"
import {
  routes,
  settingsNavGroups,
  settingsSectionLabels,
} from "../utils/navigation"
import { isPersonalWorkspace } from "../utils/workspace"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
    isActive
      ? "bg-neutral-100 text-accent dark:bg-neutral-800"
      : "text-neutral-500 hover:bg-neutral-50 hover:text-accent dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100",
  ].join(" ")

const SettingsLayout = () => {
  const { activeOrganization } = useWorkspace()
  const location = useLocation()
  const hideTeam =
    !activeOrganization || isPersonalWorkspace(activeOrganization)

  const sectionKey = location.pathname.split("/")[2] ?? "general"
  const sectionLabel =
    settingsSectionLabels[sectionKey] ??
    (sectionKey ? sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1) : "General")

  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="w-full shrink-0 lg:w-48">
          <p className="mb-3 text-xs text-neutral-400">
            <Link
              to={routes.settingsGeneral}
              className="hover:text-accent dark:hover:text-neutral-200"
            >
              Settings
            </Link>
            <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-neutral-600 dark:text-neutral-300">{sectionLabel}</span>
          </p>

          <nav className="flex flex-row gap-4 overflow-x-auto pb-1 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0" aria-label="Settings">
            {settingsNavGroups.map((group) => {
              const items = group.items.filter(
                (item) => !(hideTeam && item.path === routes.settingsTeam),
              )
              if (items.length === 0) return null

              return (
                <div key={group.label} className="min-w-max lg:min-w-0">
                  <p className="px-2 pb-1 text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-row gap-0.5 lg:flex-col">
                    {items.map(({ label, path, icon: Icon, end }) => (
                      <NavLink
                        key={path}
                        to={path}
                        end={end}
                        className={linkClass}
                      >
                        <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export default SettingsLayout
