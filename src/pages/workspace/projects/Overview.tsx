import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineKey,
} from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import WorkspaceQuotaStrip from "../../../components/workspace/WorkspaceQuotaStrip"
import SuccessArc from "../../../components/workspace/SuccessArc"
import PeakDayBars from "../../../components/workspace/PeakDayBars"
import QuotaPaceChart from "../../../components/workspace/QuotaPaceChart"
import ShareBars from "../../../components/workspace/ShareBars"
import RecentRequestsTable from "../../../components/workspace/RecentRequestsTable"
import Skeleton from "../../../components/common/Skeleton"
import { useAuth } from "../../../contexts/AuthContext"
import { useWorkspace } from "../../../contexts/WorkspaceContext"
import { projectUsageQuery } from "../../../utils/queries"
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
import type { BindingQuota } from "../../../utils/quota"
import { routes } from "../../../utils/navigation"

const OverviewSkeleton = () => (
  <div className="flex flex-col gap-2.5" aria-busy="true" role="status">
    <span className="sr-only">Loading overview…</span>
    <Skeleton className="h-14 rounded-2xl" />
    <div className="grid gap-2.5 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-48 rounded-2xl" />
    <div className="grid gap-2.5 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-36 rounded-2xl" />
  </div>
)

/** Binding used only to pick series (requests vs tokens) for the project burn chart. */
const projectBurnBinding = (
  requestsUsed: number,
  tokensUsed: number,
): BindingQuota => {
  const preferTokens = tokensUsed > requestsUsed * 100
  return {
    resource: preferTokens ? "tokens" : "requests",
    used: preferTokens ? tokensUsed : requestsUsed,
    limit: 0,
    remaining: 0,
    percentUsed: 0,
    unlimited: true,
  }
}

const Overview = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()
  const { projects } = useWorkspace()

  const contextProject = useMemo(
    () => projects.find((p) => p.id === projectId) ?? null,
    [projects, projectId],
  )

  const usageQuery = useQuery({
    ...projectUsageQuery(token ?? "", projectId ?? ""),
    enabled: Boolean(token && projectId),
  })
  const usage = usageQuery.data
  const isLoading = usageQuery.isLoading
  const error = !projectId
    ? "Missing project"
    : !token
      ? "Not authenticated"
      : (usageQuery.error?.message ?? null)

  const project = usage?.project ?? contextProject
  const period = usage?.period
  const orgPeriod = usage?.organizationPeriod
  const daily = usage?.daily ?? []
  const rate = period
    ? successRatePercent(period.successfulRequests, period.failedRequests)
    : null

  const title = project?.name ?? "Overview"
  const environment = project?.environment
    ? formatProjectEnvironment(project.environment)
    : null
  const status = project?.status

  const projectShareOfWorkspace = useMemo(() => {
    const orgRequests = orgPeriod?.requestsUsed ?? 0
    const projectRequests = period?.requestsUsed ?? 0
    if (orgRequests <= 0) return null
    return Math.round((projectRequests / orgRequests) * 100)
  }, [orgPeriod?.requestsUsed, period?.requestsUsed])

  const modelShareItems = useMemo(
    () =>
      (usage?.byModel ?? []).map((row) => ({
        id: String(row.modelId),
        name: row.model,
        value: row.tokensUsed,
      })),
    [usage?.byModel],
  )

  const burnBinding = projectBurnBinding(
    period?.requestsUsed ?? 0,
    period?.tokensUsed ?? 0,
  )

  return (
    <WorkspacePage
      title={title}
      description="Project health, burn, and shortcuts — workspace quota stays in context."
    >
      {project ? (
        <div className="mb-0.5 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          {environment ? <span className="text-xs">{environment}</span> : null}
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
        <OverviewSkeleton />
      ) : (
        <div className="flex flex-col gap-2.5">
          <WorkspaceQuotaStrip
            plan={usage?.plan ?? null}
            organizationPeriod={orgPeriod ?? null}
            organizationDaily={usage?.organizationDaily ?? []}
            projectSharePercent={projectShareOfWorkspace}
          />

          <div className="grid gap-2.5 sm:grid-cols-3">
            <SuccessArc
              compact
              percent={rate}
              detail={
                period
                  ? `${formatCompactNumber(period.successfulRequests)} ok · ${formatCompactNumber(period.failedRequests)} failed`
                  : undefined
              }
            />
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-[15px] font-medium text-accent">Avg latency</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-accent">
                {formatLatency(period?.avgLatency ?? null)}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">
                Successful requests this month
              </p>
            </section>
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-[15px] font-medium text-accent">API keys</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-accent">
                {usage?.keys.active ?? 0}
                <span className="text-base font-normal text-neutral-400">
                  {" "}
                  / {usage?.keys.total ?? 0}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">Active / total</p>
            </section>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-5">
            <section className="rounded-2xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-900 lg:col-span-3">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-[15px] font-medium text-accent">
                  Project burn this month
                </h2>
                <p className="text-xs tabular-nums text-neutral-400">
                  {formatCompactNumber(period?.requestsUsed ?? 0)} requests ·{" "}
                  {formatTokens(period?.tokensUsed ?? 0)} tokens
                </p>
              </div>
              <QuotaPaceChart
                daily={daily}
                binding={burnBinding}
                showPaceLine={false}
                className="mt-2"
              />
            </section>
            <PeakDayBars
              daily={daily}
              compact
              className="lg:col-span-2"
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <Link
              to={projectId ? routes.projectApiKeys(projectId) : "#"}
              className="flex items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white px-3.5 py-3 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineKey
                className="size-5 shrink-0 text-neutral-400"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">API keys</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  Manage credentials
                </p>
              </div>
            </Link>
            <Link
              to={projectId ? routes.projectLogs(projectId) : "#"}
              className="flex items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white px-3.5 py-3 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineDocumentText
                className="size-5 shrink-0 text-neutral-400"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">Logs</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  Inspect invocations
                </p>
              </div>
            </Link>
            <Link
              to={projectId ? routes.projectSettings(projectId) : "#"}
              className="flex items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white px-3.5 py-3 transition hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <HiOutlineCog6Tooth
                className="size-5 shrink-0 text-neutral-400"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">Settings</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  Project & origins
                </p>
              </div>
            </Link>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ShareBars
                title="Share of tokens by model"
                items={modelShareItems}
                formatValue={formatTokens}
              />
            </div>
            <section className="space-y-2 lg:col-span-3">
              <h2 className="text-[15px] font-medium text-accent">
                Recent invocations
              </h2>
              <RecentRequestsTable
                items={usage?.recentRequests ?? []}
                logsHref={projectId ? routes.projectLogs(projectId) : undefined}
                variant="cards"
                emptyDescription="Inference traffic for this project will show up here."
              />
            </section>
          </div>
        </div>
      )}
    </WorkspacePage>
  )
}

export default Overview
