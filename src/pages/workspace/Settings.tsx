import WorkspacePage from "../../components/workspace/WorkspacePage"
import UserAvatar from "../../components/common/UserAvatar"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import type { ThemePreference } from "../../services/UserService"

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
  { value: "DEVICE", label: "Device" },
]

const Settings = () => {
  const { activeOrganization, role, isLoading } = useWorkspace()
  const { themePreference, setThemePreference, isSaving } = useTheme()
  const { user, appBootstrap } = useAuth()

  const avatarSrc =
    appBootstrap?.user.profilePicture ??
    (typeof user?.image === "string" ? user.image : null)

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Settings"
        description="Workspace identity and account preferences."
      >
        <div className="max-w-xl space-y-4">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-accent">Workspace</h2>
            {isLoading && !activeOrganization ? (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Loading…
              </p>
            ) : activeOrganization ? (
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Name
                  </dt>
                  <dd className="mt-1 font-medium text-accent">
                    {activeOrganization.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Slug
                  </dt>
                  <dd className="mt-1 font-mono text-neutral-600 dark:text-neutral-300">
                    {activeOrganization.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Your role
                  </dt>
                  <dd className="mt-1 capitalize text-neutral-600 dark:text-neutral-300">
                    {role ?? "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                No workspace loaded.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-accent">Account</h2>

            <div className="mt-4 flex items-center gap-3">
              <UserAvatar
                src={avatarSrc}
                name={user?.name}
                email={user?.email}
                className="size-11"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-accent">
                  {user?.name || "Account"}
                </p>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs tracking-wide text-neutral-400 uppercase">
                Theme
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Choose how Ainvoker looks for your account.
              </p>
              <div
                className="mt-3 inline-flex rounded-lg border border-neutral-200/80 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
                role="group"
                aria-label="Theme preference"
              >
                {themeOptions.map(({ value, label }) => {
                  const selected = themePreference === value
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isSaving}
                      aria-pressed={selected}
                      onClick={() => void setThemePreference(value)}
                      className={[
                        "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-60",
                        selected
                          ? "bg-white text-accent shadow-sm dark:bg-neutral-950 dark:text-neutral-100"
                          : "text-neutral-500 hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Settings
