import { type FormEvent, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { HiOutlineClipboardDocument } from "react-icons/hi2"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import UserAvatar from "../../components/common/UserAvatar"
import Button from "../../components/common/Button"
import InlineLoader from "../../components/common/InlineLoader"
import ThemeToggle from "../../components/common/ThemeToggle"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import UserService, { formatAppUserName } from "../../services/UserService"
import { isPersonalWorkspace } from "../../utils/workspace"

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const Settings = () => {
  const location = useLocation()
  const { activeOrganization, role, isLoading, deleteWorkspace } = useWorkspace()
  const { token, appBootstrap, patchAppUser } = useAuth()

  const appUser = appBootstrap?.user
  const displayName = formatAppUserName(appUser) || "Account"
  const avatarSrc = appUser?.profilePicture ?? null
  const email = appUser?.email ?? null
  const isPersonal = Boolean(
    activeOrganization && isPersonalWorkspace(activeOrganization.slug),
  )

  const canDeleteWorkspace =
    role === "owner" && activeOrganization && !isPersonal

  const [firstName, setFirstName] = useState(appUser?.firstName ?? "")
  const [lastName, setLastName] = useState(appUser?.lastName ?? "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  const [copiedSlug, setCopiedSlug] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setFirstName(appUser?.firstName ?? "")
    setLastName(appUser?.lastName ?? "")
  }, [appUser?.firstName, appUser?.lastName])

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "")
    if (!hash) return
    const id = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.hash])

  const deleteNameMatches =
    Boolean(activeOrganization) &&
    deleteConfirmName.trim() === activeOrganization?.name

  const handleCopySlug = async () => {
    if (!activeOrganization?.slug) return
    try {
      await navigator.clipboard.writeText(activeOrganization.slug)
      setCopiedSlug(true)
      window.setTimeout(() => setCopiedSlug(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    if (!trimmedFirst) {
      setProfileError("First name is required")
      setProfileSuccess(null)
      return
    }

    setIsSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    const [updated, err] = await UserService.updateProfile(token, {
      firstName: trimmedFirst,
      lastName: trimmedLast.length > 0 ? trimmedLast : null,
    })
    setIsSavingProfile(false)

    if (err || !updated) {
      setProfileError(err ?? "Failed to save profile")
      return
    }

    patchAppUser(updated)
    setFirstName(updated.firstName ?? "")
    setLastName(updated.lastName ?? "")
    setProfileSuccess("Profile saved")
  }

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
        <div className="flex max-w-2xl flex-col gap-8">
          <section id="workspace" className="scroll-mt-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-accent">Workspace</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Identity for the workspace you are currently using.
              </p>
            </div>

            {isLoading && !activeOrganization ? (
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <InlineLoader label="Loading…" />
              </div>
            ) : activeOrganization ? (
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-accent dark:bg-neutral-800">
                    {role ?? "member"}
                  </span>
                  {isPersonal ? (
                    <span className="text-xs text-neutral-400">Personal</span>
                  ) : null}
                </div>

                <div className="text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    Name
                  </span>
                  <p className="font-medium text-accent">
                    {activeOrganization.name}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    Slug
                  </span>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-accent dark:border-neutral-700 dark:bg-neutral-950">
                      {activeOrganization.slug}
                    </code>
                    <button
                      type="button"
                      onClick={() => void handleCopySlug()}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      <HiOutlineClipboardDocument
                        className="size-4"
                        aria-hidden
                      />
                      {copiedSlug ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {isPersonal ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Your Personal workspace cannot be renamed or deleted.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl border border-neutral-200/80 bg-white p-5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                No workspace loaded.
              </p>
            )}
          </section>

          <section id="account" className="scroll-mt-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-accent">Account</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Your profile and how AInvoker looks across workspaces.
              </p>
            </div>

            <form
              onSubmit={(event) => void handleSaveProfile(event)}
              className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-3">
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
                    {email ?? "No email on file"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    First name
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className={inputClassName}
                    disabled={isSavingProfile || !token}
                    maxLength={100}
                    required
                    autoComplete="given-name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    Last name
                  </span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className={inputClassName}
                    disabled={isSavingProfile || !token}
                    maxLength={100}
                    autoComplete="family-name"
                  />
                </label>
              </div>

              {profileError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {profileError}
                </p>
              ) : null}
              {profileSuccess ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {profileSuccess}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="!px-4 !py-2.5 text-sm"
                  loading={isSavingProfile}
                  disabled={!token}
                >
                  Save changes
                </Button>
              </div>

              <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <p className="text-xs tracking-wide text-neutral-400 uppercase">
                  Theme
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Choose how AInvoker looks for your account.
                </p>
                <ThemeToggle className="mt-3" />
              </div>
            </form>
          </section>

          {canDeleteWorkspace && activeOrganization ? (
            <section id="danger" className="scroll-mt-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Danger zone
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Irreversible actions for this workspace.
                </p>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-accent">
                      Delete workspace
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Cancel billing and remove this workspace from your
                      account. This cannot be undone from the app. Your Personal
                      workspace is not affected.
                    </p>
                  </div>
                  {!showDeleteConfirm ? (
                    <Button
                      type="button"
                      className="!bg-red-600 !px-3 !py-2 text-sm shrink-0 hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setDeleteError(null)
                        setDeleteConfirmName("")
                      }}
                    >
                      Delete workspace
                    </Button>
                  ) : null}
                </div>

                {showDeleteConfirm ? (
                  <form
                    onSubmit={(event) => void handleDeleteWorkspace(event)}
                    className="mt-4 space-y-3 border-t border-red-100 pt-4 dark:border-red-900/40"
                  >
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                        Type “{activeOrganization.name}” to confirm
                      </span>
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={(event) =>
                          setDeleteConfirmName(event.target.value)
                        }
                        className={inputClassName}
                        disabled={isDeleting}
                        autoComplete="off"
                        placeholder={activeOrganization.name}
                      />
                    </label>

                    {deleteError ? (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {deleteError}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="!bg-red-600 !px-3 !py-2 text-sm hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                        loading={isDeleting}
                        disabled={!deleteNameMatches}
                      >
                        Confirm delete
                      </Button>
                      <Button
                        type="button"
                        className="!bg-transparent !px-3 !py-2 text-sm !text-neutral-600 ring-1 ring-neutral-200 hover:!bg-neutral-50 dark:!text-neutral-300 dark:ring-neutral-700 dark:hover:!bg-neutral-800"
                        disabled={isDeleting}
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmName("")
                          setDeleteError(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Settings
