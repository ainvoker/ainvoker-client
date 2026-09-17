import { type FormEvent, useEffect, useState } from "react"
import { HiOutlineClipboardDocument } from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import Button from "../../../components/common/Button"
import InlineLoader from "../../../components/common/InlineLoader"
import { useWorkspace } from "../../../contexts/WorkspaceContext"
import { workspacePermissions } from "../../../utils/workspace"

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const General = () => {
  const { activeOrganization, role, isLoading, updateWorkspace, deleteWorkspace } =
    useWorkspace()

  const { isPersonal, canEdit, canDelete } = workspacePermissions(activeOrganization)

  const [workspaceName, setWorkspaceName] = useState(
    activeOrganization?.name ?? "",
  )
  const [workspaceSlug, setWorkspaceSlug] = useState(
    activeOrganization?.slug ?? "",
  )
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)
  const [workspaceSuccess, setWorkspaceSuccess] = useState<string | null>(null)

  const [copiedSlug, setCopiedSlug] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setWorkspaceName(activeOrganization?.name ?? "")
    setWorkspaceSlug(activeOrganization?.slug ?? "")
    setWorkspaceError(null)
    setWorkspaceSuccess(null)
    setShowDeleteConfirm(false)
    setDeleteConfirmName("")
    setDeleteError(null)
  }, [
    activeOrganization?.id,
    activeOrganization?.name,
    activeOrganization?.slug,
  ])

  const workspaceDirty =
    workspaceName.trim() !== (activeOrganization?.name ?? "") ||
    workspaceSlug.trim() !== (activeOrganization?.slug ?? "")

  const deleteNameMatches =
    Boolean(activeOrganization) &&
    deleteConfirmName.trim() === activeOrganization?.name

  const handleCopy = async (value: string, kind: "slug" | "id") => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      if (kind === "slug") {
        setCopiedSlug(true)
        window.setTimeout(() => setCopiedSlug(false), 1500)
      } else {
        setCopiedId(true)
        window.setTimeout(() => setCopiedId(false), 1500)
      }
    } catch {
      // ignore
    }
  }

  const handleCancel = () => {
    setWorkspaceName(activeOrganization?.name ?? "")
    setWorkspaceSlug(activeOrganization?.slug ?? "")
    setWorkspaceError(null)
    setWorkspaceSuccess(null)
  }

  const handleSaveWorkspace = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!activeOrganization || !canEdit) return

    const trimmedName = workspaceName.trim()
    const trimmedSlug = workspaceSlug.trim().toLowerCase()
    if (!trimmedName) {
      setWorkspaceError("Name is required")
      setWorkspaceSuccess(null)
      return
    }
    if (!SLUG_PATTERN.test(trimmedSlug)) {
      setWorkspaceError(
        "Slug must be lowercase letters, numbers, and hyphens",
      )
      setWorkspaceSuccess(null)
      return
    }
    if (trimmedSlug.startsWith("personal-")) {
      setWorkspaceError("Slug cannot use the Personal workspace prefix")
      setWorkspaceSuccess(null)
      return
    }

    const input: { name?: string; slug?: string } = {}
    if (trimmedName !== activeOrganization.name) input.name = trimmedName
    if (trimmedSlug !== activeOrganization.slug) input.slug = trimmedSlug
    if (!input.name && !input.slug) return

    setIsSavingWorkspace(true)
    setWorkspaceError(null)
    setWorkspaceSuccess(null)

    const [updated, err] = await updateWorkspace(activeOrganization.id, input)
    setIsSavingWorkspace(false)

    if (err || !updated) {
      setWorkspaceError(err?.message ?? "Failed to save workspace")
      return
    }

    setWorkspaceName(updated.name)
    setWorkspaceSlug(updated.slug)
    setWorkspaceSuccess("Workspace saved")
  }

  const handleDeleteWorkspace = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeOrganization || !canDelete) return

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
    <WorkspacePage
      title="General"
      description="Identity for the workspace you are currently using."
    >
      <div className="flex max-w-2xl flex-col gap-8 pb-24">
        {isLoading && !activeOrganization ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <InlineLoader label="Loading…" />
          </div>
        ) : activeOrganization ? (
          <section className="space-y-4">
            <form
              id="workspace-general-form"
              onSubmit={(event) => void handleSaveWorkspace(event)}
              className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-accent dark:bg-neutral-800">
                  {role ?? activeOrganization.role ?? "member"}
                </span>
                {isPersonal ? (
                  <span className="text-xs text-neutral-400">Personal</span>
                ) : null}
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Name
                </span>
                {canEdit ? (
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    className={inputClassName}
                    disabled={isSavingWorkspace}
                    maxLength={100}
                    required
                  />
                ) : (
                  <p className="font-medium text-accent">
                    {activeOrganization.name}
                  </p>
                )}
              </label>

              <div className="text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Slug
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {canEdit ? (
                    <input
                      type="text"
                      value={workspaceSlug}
                      onChange={(event) =>
                        setWorkspaceSlug(event.target.value.toLowerCase())
                      }
                      className={`${inputClassName} min-w-0 flex-1 font-mono text-xs`}
                      disabled={isSavingWorkspace}
                      maxLength={64}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                  ) : (
                    <code className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-accent dark:border-neutral-700 dark:bg-neutral-950">
                      {activeOrganization.slug}
                    </code>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy(
                        (canEdit ? workspaceSlug : activeOrganization.slug).trim(),
                        "slug",
                      )
                    }
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

              <div className="text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Workspace ID
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-accent dark:border-neutral-700 dark:bg-neutral-950">
                    {activeOrganization.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => void handleCopy(activeOrganization.id, "id")}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <HiOutlineClipboardDocument
                      className="size-4"
                      aria-hidden
                    />
                    {copiedId ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {isPersonal ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your Personal workspace cannot be renamed or deleted.
                </p>
              ) : !canEdit ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Only owners and admins can edit this workspace.
                </p>
              ) : null}

              {workspaceError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {workspaceError}
                </p>
              ) : null}
              {workspaceSuccess ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {workspaceSuccess}
                </p>
              ) : null}
            </form>
          </section>
        ) : (
          <p className="rounded-2xl border border-neutral-200/80 bg-white p-5 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            No workspace loaded.
          </p>
        )}

        {canDelete && activeOrganization ? (
          <section className="space-y-4">
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
                    Cancel billing and remove this workspace from your account.
                    This cannot be undone from the app. Your Personal workspace
                    is not affected.
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

      {canEdit && workspaceDirty ? (
        <div className="sticky bottom-4 z-10 flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200/80 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <Button
              type="button"
              className="!bg-transparent !px-4 !py-2.5 text-sm !text-neutral-600 ring-1 ring-neutral-200 hover:!bg-neutral-50 dark:!text-neutral-300 dark:ring-neutral-700 dark:hover:!bg-neutral-800"
              disabled={isSavingWorkspace}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="workspace-general-form"
              className="!px-4 !py-2.5 text-sm"
              loading={isSavingWorkspace}
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </WorkspacePage>
  )
}

export default General
