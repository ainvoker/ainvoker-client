import { type FormEvent, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  HiOutlineClipboardDocument,
  HiOutlineGlobeAlt,
  HiOutlinePlus,
} from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import Button from "../../../components/common/Button"
import { useAuth } from "../../../contexts/AuthContext"
import { useWorkspace } from "../../../contexts/WorkspaceContext"
import AllowedOriginService, {
  type AllowedOrigin,
} from "../../../services/AllowedOriginService"
import ProjectService, {
  type AppProject,
  type ProjectEnvironment,
} from "../../../services/ProjectService"
import { routes } from "../../../utils/navigation"
import {
  formatProjectEnvironment,
  formatProjectStatus,
  getProjectById,
  isProjectInactive,
  PROJECT_ENVIRONMENTS,
  projectStatusBadgeClass,
} from "../../../utils/projects"

const formatDate = (value: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const ProjectSettings = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { projects, updateProject, deleteProject } = useWorkspace()

  const cached = projectId ? getProjectById(projects, projectId) : undefined

  const [project, setProject] = useState<AppProject | null>(cached ?? null)
  const [isProjectLoading, setIsProjectLoading] = useState(!cached)
  const [projectError, setProjectError] = useState<string | null>(null)

  const [name, setName] = useState(cached?.name ?? "")
  const [description, setDescription] = useState(cached?.description ?? "")
  const [environment, setEnvironment] = useState<ProjectEnvironment>(
    (cached?.environment as ProjectEnvironment) ?? "DEVELOPMENT",
  )
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  const [origins, setOrigins] = useState<AllowedOrigin[]>([])
  const [isOriginsLoading, setIsOriginsLoading] = useState(true)
  const [originsError, setOriginsError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyOriginId, setBusyOriginId] = useState<string | null>(null)
  const [draftOrigin, setDraftOrigin] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const applyProject = useCallback((next: AppProject) => {
    setProject(next)
    setName(next.name)
    setDescription(next.description ?? "")
    setEnvironment(
      (PROJECT_ENVIRONMENTS.includes(next.environment as ProjectEnvironment)
        ? next.environment
        : "DEVELOPMENT") as ProjectEnvironment,
    )
  }, [])

  useEffect(() => {
    if (cached) {
      applyProject(cached)
      setIsProjectLoading(false)
      setProjectError(null)
    }
  }, [cached, applyProject])

  useEffect(() => {
    if (!token || !projectId) {
      setIsProjectLoading(false)
      setProjectError(!projectId ? "Missing project" : "Not authenticated")
      return
    }

    if (cached) return

    let cancelled = false
    void (async () => {
      setIsProjectLoading(true)
      setProjectError(null)
      const [data, err] = await ProjectService.get(token, projectId)
      if (cancelled) return
      if (err || !data) {
        setProject(null)
        setProjectError(err ?? "Failed to load project")
        setIsProjectLoading(false)
        return
      }
      applyProject(data)
      setIsProjectLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [token, projectId, cached, applyProject])

  const loadOrigins = useCallback(async () => {
    if (!token || !projectId) {
      setOrigins([])
      setIsOriginsLoading(false)
      setOriginsError(!projectId ? "Missing project" : "Not authenticated")
      return
    }

    setIsOriginsLoading(true)
    setOriginsError(null)

    const [data, err] = await AllowedOriginService.list(token, projectId)
    if (err || !data) {
      setOrigins([])
      setOriginsError(err ?? "Failed to load allowed origins")
      setIsOriginsLoading(false)
      return
    }

    setOrigins(data)
    setIsOriginsLoading(false)
  }, [token, projectId])

  useEffect(() => {
    void loadOrigins()
  }, [loadOrigins])

  const handleCopyId = async () => {
    if (!project?.id) return
    try {
      await navigator.clipboard.writeText(project.id)
      setCopiedId(true)
      window.setTimeout(() => setCopiedId(false), 1500)
    } catch {
      setGeneralError("Could not copy project ID")
    }
  }

  const handleSaveGeneral = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectId || !project) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setGeneralError("Name is required")
      setGeneralSuccess(null)
      return
    }

    setIsSavingGeneral(true)
    setGeneralError(null)
    setGeneralSuccess(null)

    const trimmedDescription = description.trim()
    const [updated, err] = await updateProject(projectId, {
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
      environment,
    })
    setIsSavingGeneral(false)

    if (err || !updated) {
      setGeneralError(err ?? "Failed to save project")
      return
    }

    applyProject(updated)
    setGeneralSuccess("Project details saved")
  }

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !projectId) return

    const origin = draftOrigin.trim()
    if (!origin) {
      setActionError("Enter an origin URL")
      return
    }

    setIsAdding(true)
    setActionError(null)

    const [created, err] = await AllowedOriginService.create(token, projectId, {
      origin,
    })
    setIsAdding(false)

    if (err || !created) {
      setActionError(err ?? "Failed to add origin")
      return
    }

    setDraftOrigin("")
    setOrigins((prev) => [created, ...prev.filter((row) => row.id !== created.id)])
  }

  const handleRemove = async (row: AllowedOrigin) => {
    if (!token || !projectId) return
    const confirmed = window.confirm(
      `Remove “${row.origin}”? Browser apps on this origin will no longer be able to call the SDK.`,
    )
    if (!confirmed) return

    setBusyOriginId(row.id)
    setActionError(null)
    const [, err] = await AllowedOriginService.remove(token, projectId, row.id)
    setBusyOriginId(null)

    if (err) {
      setActionError(err)
      return
    }

    setOrigins((prev) => prev.filter((item) => item.id !== row.id))
  }

  const handleToggleStatus = async () => {
    if (!projectId || !project) return

    const nextStatus = isProjectInactive(project.status) ? "ACTIVE" : "DISABLED"
    setIsTogglingStatus(true)
    setStatusError(null)

    const [updated, err] = await updateProject(projectId, { status: nextStatus })
    setIsTogglingStatus(false)

    if (err || !updated) {
      setStatusError(err ?? "Failed to update project status")
      return
    }

    applyProject(updated)
  }

  const handleDelete = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectId || !project) return

    if (deleteConfirmName.trim() !== project.name) {
      setDeleteError("Type the project name exactly to confirm deletion")
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    const [, err] = await deleteProject(projectId)
    setIsDeleting(false)

    if (err) {
      setDeleteError(err)
      return
    }

    navigate(routes.projects)
  }

  const inactive = project ? isProjectInactive(project.status) : false
  const deleteNameMatches =
    Boolean(project) && deleteConfirmName.trim() === project?.name

  return (
    <WorkspacePage
      title="Settings"
      description="Project metadata and browser origins allowed to call the SDK."
    >
      <div className="flex flex-col gap-8">
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-accent">General</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Name, environment, and identifiers for this project.
            </p>
          </div>

          {projectError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {projectError}
            </p>
          ) : null}

          {isProjectLoading && !project ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading project…
            </p>
          ) : project ? (
            <form
              onSubmit={(event) => void handleSaveGeneral(event)}
              className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                    projectStatusBadgeClass(project.status),
                  ].join(" ")}
                >
                  {formatProjectStatus(project.status)}
                </span>
                <span className="text-xs text-neutral-400">
                  {formatProjectEnvironment(project.environment)}
                </span>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                  disabled={isSavingGeneral}
                  maxLength={100}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Environment
                </span>
                <select
                  value={environment}
                  onChange={(event) =>
                    setEnvironment(event.target.value as ProjectEnvironment)
                  }
                  className={inputClassName}
                  disabled={isSavingGeneral}
                >
                  {PROJECT_ENVIRONMENTS.map((env) => (
                    <option key={env} value={env}>
                      {formatProjectEnvironment(env)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className={`${inputClassName} resize-none`}
                  disabled={isSavingGeneral}
                  maxLength={2000}
                  placeholder="What this project is for"
                />
              </label>

              <div className="text-sm">
                <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                  Project ID
                </span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-accent dark:border-neutral-700 dark:bg-neutral-950">
                    {project.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => void handleCopyId()}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <HiOutlineClipboardDocument className="size-4" aria-hidden />
                    {copiedId ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {generalError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
              ) : null}
              {generalSuccess ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {generalSuccess}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="!px-4 !py-2.5 text-sm"
                  loading={isSavingGeneral}
                  disabled={!token || !projectId}
                >
                  Save changes
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-accent">Allowed app URLs</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Add the exact origin of each browser app that should call AInvoker
              directly (scheme + host + port). Server / Node SDK calls do not need
              this. Until you add a URL, browser requests are denied.
            </p>
          </div>

          <form
            onSubmit={(event) => void handleAdd(event)}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <label className="min-w-0 flex-1 text-sm">
              <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                Origin
              </span>
              <input
                type="url"
                value={draftOrigin}
                onChange={(event) => setDraftOrigin(event.target.value)}
                placeholder="https://app.example.com"
                className={inputClassName}
                disabled={!token || !projectId || isAdding}
              />
            </label>
            <Button
              type="submit"
              className="!py-2.5 !px-3 text-sm shrink-0"
              disabled={!token || !projectId}
              loading={isAdding}
            >
              <HiOutlinePlus className="size-4" aria-hidden />
              Add URL
            </Button>
          </form>

          {originsError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {originsError}
            </p>
          ) : null}

          {actionError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {actionError}
            </p>
          ) : null}

          {isOriginsLoading && origins.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading allowed origins…
            </p>
          ) : origins.length === 0 && !originsError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
              <HiOutlineGlobeAlt
                className="size-8 text-neutral-300 dark:text-neutral-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">No allowed URLs yet</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Browser SDK calls will fail CORS until you add an app origin.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                      <th className="px-4 py-3 font-medium">Origin</th>
                      <th className="px-4 py-3 font-medium">Added</th>
                      <th className="px-4 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {origins.map((row) => {
                      const busy = busyOriginId === row.id
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-accent sm:text-sm">
                            {row.origin}
                          </td>
                          <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleRemove(row)}
                                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Danger zone
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Deactivate API access or permanently delete this project.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-red-200/80 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">
                  {inactive ? "Reactivate project" : "Deactivate project"}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {inactive
                    ? "Restore SDK and API-key access. Keys and history are unchanged."
                    : "Block SDK and API-key calls until you reactivate. Keys and history are kept."}
                </p>
              </div>
              <Button
                type="button"
                className={[
                  "!px-3 !py-2 text-sm shrink-0",
                  inactive
                    ? ""
                    : "!bg-amber-600 hover:!brightness-95 dark:!bg-amber-500 dark:!text-black",
                ].join(" ")}
                loading={isTogglingStatus}
                disabled={!project || !token}
                onClick={() => void handleToggleStatus()}
              >
                {inactive ? "Reactivate" : "Deactivate"}
              </Button>
            </div>

            {statusError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{statusError}</p>
            ) : null}

            <div className="border-t border-red-100 pt-4 dark:border-red-900/40">
              <p className="text-sm font-medium text-accent">Delete project</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Permanently delete this project, API keys, allowed origins, actions,
                and request logs. This cannot be undone.
              </p>

              <form
                onSubmit={(event) => void handleDelete(event)}
                className="mt-4 space-y-3"
              >
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                    Type “{project?.name ?? "…"}” to confirm
                  </span>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(event) => setDeleteConfirmName(event.target.value)}
                    className={inputClassName}
                    disabled={!project || isDeleting}
                    autoComplete="off"
                    placeholder={project?.name}
                  />
                </label>

                {deleteError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                ) : null}

                <Button
                  type="submit"
                  className="!bg-red-600 !px-3 !py-2 text-sm hover:!brightness-95 dark:!bg-red-500 dark:!text-white"
                  loading={isDeleting}
                  disabled={!project || !token || !deleteNameMatches}
                >
                  Delete project
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </WorkspacePage>
  )
}

export default ProjectSettings
