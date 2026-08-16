import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineKey,
} from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import StatCard from "../../../components/workspace/StatCard"
import QuotaBars from "../../../components/workspace/QuotaBars"
import RecentRequestsTable from "../../../components/workspace/RecentRequestsTable"
import Skeleton, { SkeletonCard } from "../../../components/common/Skeleton"
import { useAuth } from "../../../contexts/AuthContext"
import { useWorkspace } from "../../../contexts/WorkspaceContext"
import UsageService, { type ProjectUsage } from "../../../services/UsageService"
import {
  formatCompactNumber,
  formatLatency,
  formatTokens,
  successRatePercent,
} from "../../../utils/requests"
import {
  formatProjectEnvironment,
  formatProjectStatus,
  isProjectInactive,
  projectStatusBadgeClass,
} from "../../../utils/projects"
import { routes } from "../../../utils/navigation"

const Overview = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()
  const { projects } = useWorkspace()

  const contextProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  )

  const [usage, setUsage] = useState<ProjectUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsage = useCallback(async () => {
    if (!token || !projectId) {
      setUsage(null)
      setIsLoading(false)
      setError(!projectId ? "Missing project" : "Not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    const [data, err] = await UsageService.getProjectUsage(token, projectId)
    if (err || !data) {
      setUsage(null)
      setError(err ?? "Failed to load overview")
      setIsLoading(false)
      return
    }

    setUsage(data)
    setIsLoading(false)
  }, [token, projectId])

  useEffect(() => {
    void loadUsage()
  }, [loadUsage])

  const project = usage?.project ?? contextProject
  const period = usage?.period
  const rate = period
    ? successRatePercent(period.successfulRequests, period.failedRequests)
    : null

  const title = project?.name ?? "Overview"
  const environment = project?.environment
    ? formatProjectEnvironment(project.environment)
    : null
  const status = project?.status

  return (
    <WorkspacePage
      title={title}
      description="Project health, recent invocations, and infrastructure status at a glance."
    >
      {project ? (
        <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          {environment ? (
            <span className="text-xs tracking-wide uppercase">{environment}</span>
          ) : null}
          {status && isProjectInactive(status) ? (
            <span
              className={[
                "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                projectStatusBadgeClass(status),
              ].join(" ")}
            >
              {formatProjectStatus(status)}
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {isLoading && !usage ? (
        <div className="flex flex-col gap-5" aria-busy="true" role="status">
          <span className="sr-only">Loading overview…</span>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-7 w-16" />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
          <SkeletonCard />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Requests (month)"
              value={formatCompactNumber(period?.requestsUsed ?? 0)}
            />
            <StatCard
              label="Tokens (month)"
              value={formatTokens(period?.tokensUsed ?? 0)}
            />
            <StatCard
              label="Avg latency"
              value={formatLatency(period?.avgLatency ?? null)}
              hint="Successful requests"
            />
            <StatCard
              label="API keys"
              value={`${usage?.keys.active ?? 0} / ${usage?.keys.total ?? 0}`}
              hint="Active / total"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to={projectId ? routes.projectApiKeys(projectId) : "#"}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineKey
                className="size-5 text-neutral-400"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">API Keys</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Manage credentials
                </p>
              </div>
            </Link>
            <Link
              to={projectId ? routes.projectLogs(projectId) : "#"}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineDocumentText
                className="size-5 text-neutral-400"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">Logs</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Inspect invocations
                </p>
              </div>
            </Link>
            <Link
              to={projectId ? routes.projectSettings(projectId) : "#"}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineCog6Tooth
                className="size-5 text-neutral-400"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">Settings</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Project & origins
                </p>
              </div>
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <QuotaBars
              plan={usage?.plan ?? null}
              requestsUsed={period?.requestsUsed ?? 0}
              tokensUsed={period?.tokensUsed ?? 0}
              showBillingCta
            />
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-accent">
                Period health
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-neutral-400">Success rate</dt>
                  <dd className="mt-1 text-lg font-semibold text-accent">
                    {rate == null ? "—" : `${rate}%`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Successful</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-accent">
                    {formatCompactNumber(period?.successfulRequests ?? 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Failed</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-accent">
                    {formatCompactNumber(period?.failedRequests ?? 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Active keys</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-accent">
                    {formatCompactNumber(usage?.keys.active ?? 0)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-accent">
              Recent invocations
            </h2>
            <RecentRequestsTable
              items={usage?.recentRequests ?? []}
              logsHref={projectId ? routes.projectLogs(projectId) : undefined}
              emptyDescription="Inference traffic for this project will show up here."
            />
          </section>
        </div>
      )}
    </WorkspacePage>
  )
}

export default Overview
