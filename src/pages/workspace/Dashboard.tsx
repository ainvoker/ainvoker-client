import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiOutlineFolder } from "react-icons/hi2"
import Skeleton from "../../components/common/Skeleton"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import QuotaHero from "../../components/workspace/QuotaHero"
import SparkMetricChip from "../../components/workspace/SparkMetricChip"
import PeakDayBars from "../../components/workspace/PeakDayBars"
import SuccessArc from "../../components/workspace/SuccessArc"
import PlanBreakoutCard from "../../components/workspace/PlanBreakoutCard"
import ShareBars from "../../components/workspace/ShareBars"
import RecentRequestsTable from "../../components/workspace/RecentRequestsTable"
import UsageRangePicker from "../../components/workspace/UsageRangePicker"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import type {
  AnalyticsRange,
  UsageRangeSelection,
} from "../../services/UsageService"
import { CURRENT_PERIOD, organizationUsageQuery } from "../../utils/queries"
import {
  formatCompactNumber,
  formatTokens,
  successRatePercent,
} from "../../utils/requests"
import {
  formatWindowLabel,
  isQuotaElevated,
  resolveBindingQuota,
} from "../../utils/quota"
import { routes } from "../../utils/navigation"
import { rangeHint } from "../../utils/usageRange"

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4" aria-busy="true" role="status">
    <span className="sr-only">Loading dashboard…</span>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
    <Skeleton className="h-56 rounded-2xl" />
  </div>
)

const RANGE_MODES: AnalyticsRange[] = [
  "current_period",
  "7d",
  "calendar_month",
  "custom",
]

const Dashboard = () => {
  const { token } = useAuth()
  const {
    activeOrganization,
    activeOrganizationId,
    isLoading: workspaceLoading,
  } = useWorkspace()

  const [rangeState, setRangeState] = useState<{
    organizationId: string | null
    selection: UsageRangeSelection
  }>({ organizationId: activeOrganizationId, selection: CURRENT_PERIOD })
  const selection =
    rangeState.organizationId === activeOrganizationId
      ? rangeState.selection
      : CURRENT_PERIOD
  const setSelection = (next: UsageRangeSelection) =>
    setRangeState({ organizationId: activeOrganizationId, selection: next })

  const usageQuery = useQuery({
    ...organizationUsageQuery(
      token ?? "",
      activeOrganizationId ?? "",
      selection,
    ),
    enabled: Boolean(token && activeOrganizationId),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === activeOrganizationId ? previous : undefined,
  })
  const usage = usageQuery.data
  const isRefreshing = usageQuery.isPlaceholderData
  const error = !activeOrganizationId
    ? null
    : !token
      ? "Not authenticated"
      : (usageQuery.error?.message ?? null)

  const workspaceName = activeOrganization?.name ?? "this workspace"
  const busy = workspaceLoading || usageQuery.isLoading
  const period = usage?.period
  const daily = useMemo(() => usage?.daily ?? [], [usage?.daily])
  const rate = period
    ? successRatePercent(period.successfulRequests, period.failedRequests)
    : null

  const quota = usage?.quota
  const binding = resolveBindingQuota(
    quota?.requestsUsed ?? 0,
    quota?.tokensUsed ?? 0,
    usage?.plan ?? null,
  )
  const elevated = isQuotaElevated(binding.percentUsed, binding.unlimited)
  const noPlan = !usage?.plan?.entitled
  const hint = rangeHint(selection)

  const requestSeries = useMemo(
    () => daily.map((d) => d.requestsUsed),
    [daily],
  )
  const tokenSeries = useMemo(() => daily.map((d) => d.tokensUsed), [daily])
  const successSeries = useMemo(
    () =>
      daily.map((d) => {
        const total = d.successfulRequests + d.failedRequests
        return total > 0
          ? Math.round((d.successfulRequests / total) * 100)
          : 0
      }),
    [daily],
  )

  const projectShareItems = useMemo(
    () =>
      (usage?.projects ?? []).map((project) => ({
        id: project.id,
        name: project.name,
        value: project.requestsUsed,
        href: routes.projectOverview(project.id),
      })),
    [usage?.projects],
  )

  const modelShareItems = useMemo(
    () =>
      (usage?.byModel ?? []).map((row) => ({
        id: String(row.modelId),
        name: row.model,
        value: row.tokensUsed,
      })),
    [usage?.byModel],
  )

  const footerSegments = useMemo(
    () =>
      projectShareItems.map((p) => ({
        id: p.id,
        name: p.name,
        value: p.value,
        href: p.href,
      })),
    [projectShareItems],
  )

  return (
    <main className="flex-1 overflow-auto bg-neutral-50 p-4 md:p-5 lg:p-6 dark:bg-neutral-950">
      <WorkspacePage
        title="Dashboard"
        description={`Monitor plan capacity and inference traffic across ${workspaceName}.`}
        actions={
          <UsageRangePicker
            key={activeOrganizationId ?? "none"}
            value={selection}
            onChange={setSelection}
            availableMonths={usage?.availableMonths ?? []}
            modes={RANGE_MODES}
            windowLabel={
              period ? (
                <p className="text-xs text-neutral-400">
                  {formatWindowLabel(period)} (UTC)
                </p>
              ) : null
            }
          />
        }
      >
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {busy && !usage ? (
          <DashboardSkeleton />
        ) : (
          <div
            className={[
              "flex flex-col gap-4 transition-opacity",
              isRefreshing ? "opacity-60" : "",
            ].join(" ")}
            aria-busy={isRefreshing}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SparkMetricChip
                label="Requests used"
                value={formatCompactNumber(period?.requestsUsed ?? 0)}
                hint={hint}
                series={requestSeries}
              />
              <SparkMetricChip
                label="Tokens used"
                value={formatTokens(period?.tokensUsed ?? 0)}
                hint={`Input + output · ${hint}`}
                series={tokenSeries}
              />
              <SparkMetricChip
                label="Success rate"
                value={rate == null ? "—" : `${rate}%`}
                hint={
                  period
                    ? `${formatCompactNumber(period.failedRequests)} failed`
                    : undefined
                }
                series={successSeries}
              />
              <SparkMetricChip
                label="Projects"
                value={formatCompactNumber(usage?.projects.length ?? 0)}
                hint="In this workspace"
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <QuotaHero
                  plan={usage?.plan ?? null}
                  requestsUsed={quota?.requestsUsed ?? 0}
                  tokensUsed={quota?.tokensUsed ?? 0}
                  chartPeriod={
                    period ?? {
                      periodStart: new Date().toISOString(),
                      periodEnd: new Date().toISOString(),
                    }
                  }
                  isCurrentPeriod={usage?.range === "current_period"}
                  daily={daily}
                  dailyByProject={usage?.dailyByProject}
                  dailyByModel={usage?.dailyByModel}
                  footerSegments={footerSegments}
                  formatSegmentValue={formatCompactNumber}
                />
              </div>
              <div className="flex flex-col gap-3">
                <PeakDayBars daily={daily} className="flex-1" />
                <SuccessArc
                  percent={rate}
                  detail={
                    period
                      ? `${formatCompactNumber(period.successfulRequests)} ok · ${formatCompactNumber(period.failedRequests)} failed`
                      : undefined
                  }
                />
              </div>
            </div>

            {noPlan || elevated ? (
              <PlanBreakoutCard
                title={
                  noPlan
                    ? "Activate a plan to unlock capacity"
                    : "You are approaching this billing period’s limit"
                }
                body={
                  noPlan
                    ? "Complete billing to create projects, issue API keys, and track quota with confidence."
                    : `${binding.percentUsed}% of your binding ${binding.resource} quota is already used. Review billing before traffic slows.`
                }
              />
            ) : null}

            <div className="grid gap-3 lg:grid-cols-2">
              <ShareBars
                title="Share of requests by project"
                items={projectShareItems}
                formatValue={formatCompactNumber}
                emptyDescription={
                  !usage || usage.projects.length === 0
                    ? "Create a project to start issuing API keys and logging traffic."
                    : "No mix to show until traffic lands."
                }
              />
              <ShareBars
                title="Share of tokens by model"
                items={modelShareItems}
                formatValue={formatTokens}
              />
            </div>

            {!usage || usage.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center dark:border-neutral-600 dark:bg-neutral-900">
                <HiOutlineFolder
                  className="size-8 text-neutral-300 dark:text-neutral-600"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-accent">
                    No projects yet
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Create a project to start issuing API keys and logging
                    traffic.
                  </p>
                </div>
                <Link
                  to={routes.projects}
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  Go to projects
                </Link>
              </div>
            ) : null}

            <section className="space-y-3">
              <h2 className="text-[15px] font-medium text-accent">
                Recent traffic
              </h2>
              <RecentRequestsTable
                items={usage?.recentRequests ?? []}
                showProject
                variant="cards"
                emptyDescription="Gateway calls across this workspace will appear here."
              />
            </section>
          </div>
        )}
      </WorkspacePage>
    </main>
  )
}

export default Dashboard
