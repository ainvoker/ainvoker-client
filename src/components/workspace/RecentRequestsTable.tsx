import { Link } from "react-router-dom"
import type { AiRequestSummary } from "../../services/AiRequestService"
import {
  formatLatency,
  formatRequestDate,
  formatRequestStatus,
  formatTokens,
  requestStatusClass,
} from "../../utils/requests"
import { routes } from "../../utils/navigation"

type RecentRequestRow = AiRequestSummary & {
  projectName?: string | null
}

type RecentRequestsTableProps = {
  items: RecentRequestRow[]
  showProject?: boolean
  logsHref?: string
  emptyTitle?: string
  emptyDescription?: string
  /** Table (default) or card list rows. */
  variant?: "table" | "cards"
}

const EmptyState = ({
  emptyTitle,
  emptyDescription,
  logsHref,
}: {
  emptyTitle: string
  emptyDescription: string
  logsHref?: string
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
    <p className="text-sm font-medium text-accent">{emptyTitle}</p>
    <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
      {emptyDescription}
    </p>
    {logsHref ? (
      <Link
        to={logsHref}
        className="mt-1 text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        View logs
      </Link>
    ) : null}
  </div>
)

const CardList = ({
  items,
  showProject,
  logsHref,
}: {
  items: RecentRequestRow[]
  showProject: boolean
  logsHref?: string
}) => (
  <div className="space-y-3">
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-neutral-200/80 bg-white px-3.5 py-2.5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                    requestStatusClass(item.requestStatus),
                  ].join(" ")}
                >
                  {formatRequestStatus(item.requestStatus)}
                </span>
                {showProject ? (
                  <Link
                    to={routes.projectLogs(item.projectId)}
                    className="truncate text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {item.projectName ?? "Project"}
                  </Link>
                ) : null}
              </div>
              <p className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {item.model}
              </p>
            </div>
            <p className="shrink-0 text-xs text-neutral-400">
              {formatRequestDate(item.createdAt)}
            </p>
          </div>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex gap-1">
              <dt>Tokens</dt>
              <dd className="tabular-nums text-accent">
                {formatTokens(item.totalTokens)}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>Latency</dt>
              <dd className="tabular-nums text-accent">
                {formatLatency(item.latency)}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
    {logsHref ? (
      <div className="flex justify-end">
        <Link
          to={logsHref}
          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          View all logs
        </Link>
      </div>
    ) : null}
  </div>
)

const RecentRequestsTable = ({
  items,
  showProject = false,
  logsHref,
  emptyTitle = "No requests yet",
  emptyDescription = "Inference traffic will show up here.",
  variant = "table",
}: RecentRequestsTableProps) => {
  if (items.length === 0) {
    return (
      <EmptyState
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        logsHref={logsHref}
      />
    )
  }

  if (variant === "cards") {
    return (
      <CardList items={items} showProject={showProject} logsHref={logsHref} />
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                <th className="px-4 py-3 font-medium">Time</th>
                {showProject ? (
                  <th className="px-4 py-3 font-medium">Project</th>
                ) : null}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Tokens</th>
                <th className="px-4 py-3 font-medium">Latency</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {formatRequestDate(item.createdAt)}
                  </td>
                  {showProject ? (
                    <td className="px-4 py-3">
                      <Link
                        to={routes.projectLogs(item.projectId)}
                        className="font-medium text-accent underline-offset-2 hover:underline"
                      >
                        {item.projectName ?? "Project"}
                      </Link>
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                        requestStatusClass(item.requestStatus),
                      ].join(" ")}
                    >
                      {formatRequestStatus(item.requestStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                    {item.model}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                    {formatTokens(item.totalTokens)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                    {formatLatency(item.latency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {logsHref ? (
        <div className="flex justify-end">
          <Link
            to={logsHref}
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            View all logs
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentRequestsTable
