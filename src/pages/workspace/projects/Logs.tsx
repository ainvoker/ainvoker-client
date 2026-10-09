import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { HiArrowPath, HiOutlineDocumentText } from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import AiRequestDetailModal from "../../../components/workspace/AiRequestDetailModal"
import Skeleton from "../../../components/common/Skeleton"
import { useAuth } from "../../../contexts/AuthContext"
import AiRequestService, {
  type AiRequestStatus,
} from "../../../services/AiRequestService"
import {
  LOGS_PAGE_SIZE,
  projectLogDetailQuery,
  projectLogsQuery,
  queryKeys,
} from "../../../utils/queries"

const STATUS_OPTIONS: { label: string; value: "" | AiRequestStatus }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Rejected", value: "REJECTED" },
]

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
    second: "2-digit",
  })
}

const formatStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  if (!normalized) return "—"
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusClass = (status: string) => {
  const normalized = status.trim().toUpperCase()
  if (normalized === "SUCCESS") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
  }
  if (normalized === "FAILED" || normalized === "REJECTED") {
    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
  }
  if (normalized === "PENDING") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
  }
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
}

const formatLatency = (ms: number | null) => {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

const formatTokens = (value: number | null) => {
  if (value == null) return "—"
  return value.toLocaleString()
}

const Logs = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const [offset, setOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState<"" | AiRequestStatus>("")
  const [isCheckingForNewLogs, setIsCheckingForNewLogs] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const missingContext = !projectId
    ? "Missing project"
    : !token
      ? "Not authenticated"
      : null

  const logsQuery = useQuery({
    ...projectLogsQuery(
      token ?? "",
      projectId ?? "",
      statusFilter || undefined,
      offset,
    ),
    enabled: !missingContext,
    placeholderData: (previous) =>
      previous?.items[0]?.projectId === projectId ? previous : undefined,
  })
  const items = logsQuery.data?.items ?? []
  const total = logsQuery.data?.total ?? 0
  const isLoading = logsQuery.isFetching
  const error =
    missingContext ?? logsQuery.error?.message ?? refreshError ?? null

  const detailQuery = useQuery({
    ...projectLogDetailQuery(token ?? "", projectId ?? "", selectedId ?? ""),
    enabled: Boolean(selectedId) && !missingContext,
  })
  const detail = detailQuery.data ?? null
  const detailLoading = detailQuery.isLoading
  const detailError = detailQuery.error?.message ?? null

  const handleStatusChange = (value: "" | AiRequestStatus) => {
    setStatusFilter(value)
    setOffset(0)
  }

  const checkForNewLogs = async () => {
    if (!token || !projectId) return
    const status = statusFilter || undefined

    setIsCheckingForNewLogs(true)
    setRefreshError(null)

    try {
      const [data, err] = await AiRequestService.list(token, projectId, {
        status,
        limit: 1,
        offset: 0,
      })

      if (err || !data) {
        setRefreshError(err ?? "Failed to check for new logs")
        return
      }

      const newestLogId = data.items[0]?.id ?? null
      const latestLogId =
        queryClient.getQueryData(
          projectLogsQuery(token, projectId, status, 0).queryKey,
        )?.items[0]?.id ?? null

      if (newestLogId === null || newestLogId === latestLogId) return

      await queryClient.invalidateQueries({
        queryKey: queryKeys.projectLogsAll(projectId),
        refetchType: "none",
      })
      if (offset === 0) {
        await logsQuery.refetch()
      } else {
        setOffset(0)
      }
    } finally {
      setIsCheckingForNewLogs(false)
    }
  }

  const closeDetail = () => setSelectedId(null)

  const canPrev = offset > 0
  const canNext = offset + LOGS_PAGE_SIZE < total
  const rangeStart = total === 0 ? 0 : offset + 1
  const rangeEnd = Math.min(offset + items.length, total)

  return (
    <>
      <WorkspacePage
        title="Logs"
        description="Stream and inspect request logs across models and actions."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Gateway invocations for this project, newest first.
            </p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    handleStatusChange(event.target.value as "" | AiRequestStatus)
                  }
                  className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-accent outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void checkForNewLogs()}
                disabled={isLoading || isCheckingForNewLogs}
                aria-label="Check for new logs"
                title="Check for new logs"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <HiArrowPath
                  className={`size-4 ${isCheckingForNewLogs ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          ) : null}

          {isLoading && items.length === 0 ? (
            <div
              className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              aria-busy="true"
              role="status"
            >
              <span className="sr-only">Loading logs…</span>
              <div className="space-y-3 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ) : items.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
              <HiOutlineDocumentText
                className="size-8 text-neutral-300 dark:text-neutral-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">No requests yet</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {statusFilter
                    ? "No requests match this status filter."
                    : "Inference traffic for this project will show up here."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Model</th>
                        <th className="px-4 py-3 font-medium">Service</th>
                        <th className="px-4 py-3 font-medium">API key</th>
                        <th className="px-4 py-3 font-medium">Tokens</th>
                        <th className="px-4 py-3 font-medium">Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="cursor-pointer border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
                          onClick={() => setSelectedId(item.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                                statusClass(item.requestStatus),
                              ].join(" ")}
                            >
                              {formatStatus(item.requestStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-accent">
                            {item.model || "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                            {item.serviceType || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-accent">{item.apiKeyName}</span>
                            <span className="ml-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                              {item.apiKeyPrefix}…
                            </span>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                            {formatTokens(item.totalTokens)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-neutral-500 dark:text-neutral-400">
                            {formatLatency(item.latency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {total === 0
                    ? "No results"
                    : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOffset((prev) => Math.max(0, prev - LOGS_PAGE_SIZE))}
                    disabled={!canPrev || isLoading}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffset((prev) => prev + LOGS_PAGE_SIZE)}
                    disabled={!canNext || isLoading}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </WorkspacePage>

      <AiRequestDetailModal
        open={Boolean(selectedId)}
        detail={detail}
        isLoading={detailLoading}
        error={detailError}
        onClose={closeDetail}
      />
    </>
  )
}

export default Logs
