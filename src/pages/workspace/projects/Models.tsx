import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { HiOutlineCpuChip, HiOutlineMagnifyingGlass } from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import Skeleton from "../../../components/common/Skeleton"
import { useAuth } from "../../../contexts/AuthContext"
import { useWorkspace } from "../../../contexts/WorkspaceContext"
import ProjectModelService, {
  type ProjectModel,
} from "../../../services/ProjectModelService"

const formatContextWindow = (value: number) => value.toLocaleString()

const Models = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()
  const { role } = useWorkspace()

  const canToggle = role === "owner" || role === "admin"

  const [models, setModels] = useState<ProjectModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyModelId, setBusyModelId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const loadModels = useCallback(async () => {
    if (!token || !projectId) {
      setModels([])
      setIsLoading(false)
      setError(!projectId ? "Missing project" : "Not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    const [data, err] = await ProjectModelService.list(token, projectId)
    if (err || !data) {
      setModels([])
      setError(err ?? "Failed to load models")
      setIsLoading(false)
      return
    }

    setModels(data)
    setIsLoading(false)
  }, [token, projectId])

  useEffect(() => {
    void loadModels()
  }, [loadModels])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return models
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(q) ||
        model.provider.toLowerCase().includes(q) ||
        model.slug.toLowerCase().includes(q),
    )
  }, [models, search])

  const handleToggle = async (model: ProjectModel) => {
    if (!token || !projectId || model.locked || !canToggle || busyModelId != null) {
      return
    }

    const next = !model.enabled
    const previous = model.enabled

    setActionError(null)
    setBusyModelId(model.id)
    setModels((prev) =>
      prev.map((row) => (row.id === model.id ? { ...row, enabled: next } : row)),
    )

    const [updated, err] = await ProjectModelService.toggle(token, projectId, model.id, {
      enabled: next,
    })

    if (err || !updated) {
      setModels((prev) =>
        prev.map((row) =>
          row.id === model.id ? { ...row, enabled: previous } : row,
        ),
      )
      setActionError(err ?? "Failed to update model")
      setBusyModelId(null)
      return
    }

    setModels((prev) =>
      prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)),
    )
    setBusyModelId(null)
  }

  return (
    <WorkspacePage
      title="Models"
      description="Choose which catalog models this project may call."
    >
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by name, provider, or slug"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-3 pl-9 text-sm text-accent outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
            aria-label="Filter models"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {actionError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {actionError}
          </p>
        ) : null}

        {isLoading && models.length === 0 ? (
          <div
            className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            aria-busy="true"
            role="status"
          >
            <span className="sr-only">Loading models…</span>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
            <HiOutlineCpuChip
              className="size-8 text-neutral-300 dark:text-neutral-600"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-accent">No models match</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Try a different search, or clear the filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((model) => {
                const busy = busyModelId === model.id
                const toggleDisabled =
                  model.locked || !canToggle || busy || busyModelId != null

                return (
                  <li
                    key={model.id}
                    className="flex flex-wrap items-center gap-4 px-4 py-4"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      <HiOutlineCpuChip className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="font-medium text-accent">{model.name}</p>
                        <p className="font-mono text-xs text-neutral-400">
                          {model.slug}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                        {model.provider}
                        <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                          ·
                        </span>
                        {formatContextWindow(model.contextWindow)} context
                        {model.freeEligible ? (
                          <>
                            <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                              ·
                            </span>
                            Free plan
                          </>
                        ) : null}
                      </p>
                      {model.locked ? (
                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                          Locked — not available on your current plan
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={model.enabled}
                      aria-label={`${model.enabled ? "Disable" : "Enable"} ${model.slug}`}
                      disabled={toggleDisabled}
                      onClick={() => void handleToggle(model)}
                      className={[
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        model.enabled
                          ? "bg-emerald-500 dark:bg-emerald-600"
                          : "bg-neutral-200 dark:bg-neutral-700",
                        toggleDisabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden
                        className={[
                          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                          model.enabled ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </WorkspacePage>
  )
}

export default Models
