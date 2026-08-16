import { type FormEvent, useState } from "react"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import UserAvatar from "../../components/common/UserAvatar"
import Button from "../../components/common/Button"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import {
  formatAppUserName,
  type ThemePreference,
} from "../../services/UserService"
import { isPersonalWorkspace } from "../../utils/workspace"

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
  { value: "DEVICE", label: "Device" },
]

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const Settings = () => {
  const { activeOrganization, role, isLoading, deleteWorkspace } = useWorkspace()
  const { themePreference, setThemePreference, isSaving } = useTheme()
  const { appBootstrap } = useAuth()

  const appUser = appBootstrap?.user
  const displayName = formatAppUserName(appUser) || "Account"
  const avatarSrc = appUser?.profilePicture ?? null
  const email = appUser?.email ?? null

  const canDeleteWorkspace =
    role === "owner" &&
    activeOrganization &&
    !isPersonalWorkspace(activeOrganization.slug)

  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteNameMatches =
    Boolean(activeOrganization) &&
    deleteConfirmName.trim() === activeOrganization?.name

  const handleDeleteWorkspace = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeOrganization || !canDeleteWorkspace) return

    if (deleteConfirmName.trim() !== activeOrganization.name) {
      setDeleteError("Type the workspace name exactly to confirm deletion")
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    const [, err] = await deleteWorkspace(activeOrganization.id)
    setIsDeleting(false)

    if (err) {
      setDeleteError(err.message)
      return
    }
  }

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
                name={displayName}
                email={email}
                className="size-11"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-accent">
                  {displayName}
                </p>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                  {email}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs tracking-wide text-neutral-400 uppercase">
                Theme
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Choose how AInvoker looks for your account.
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

          {canDeleteWorkspace ? (
            <section className="space-y-3 rounded-2xl border border-red-200/80 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
              <div>
                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Danger zone
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Soft-delete this workspace. Subscriptions are canceled and it
                  disappears from your switcher. Projects and keys remain in the
                  database but are no longer accessible from the app. Your
                  Personal workspace is not affected.
                </p>
              </div>

              <form
                onSubmit={(event) => void handleDeleteWorkspace(event)}
                className="space-y-3"
              >
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    Type “{activeOrganization.name}” to confirm
                  </span>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(event) => setDeleteConfirmName(event.target.value)}
                    className={inputClassName}
                    disabled={isDeleting}
                    autoComplete="off"
                    placeholder={activeOrganization.name}
                  />
                </label>

                {deleteError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                ) : null}

                <Button
                  type="submit"
                  className="!bg-red-600 !px-3 !py-2 text-sm hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                  loading={isDeleting}
                  disabled={!deleteNameMatches}
                >
                  Delete workspace
                </Button>
              </form>
            </section>
          ) : null}
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Settings
