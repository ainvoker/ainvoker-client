import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import SegmentedControl from "../../../components/workspace/SegmentedControl"
import SparkMetricChip from "../../../components/workspace/SparkMetricChip"
import ProjectTrafficChart from "../../../components/workspace/ProjectTrafficChart"
import PeakDayBars from "../../../components/workspace/PeakDayBars"
import SuccessArc from "../../../components/workspace/SuccessArc"
import ShareBars from "../../../components/workspace/ShareBars"
import RecentRequestsTable from "../../../components/workspace/RecentRequestsTable"
import Skeleton from "../../../components/common/Skeleton"
import { useAuth } from "../../../contexts/AuthContext"
import type { AnalyticsRange } from "../../../services/UsageService"
import { projectAnalyticsQuery } from "../../../utils/queries"
import {
  formatCompactNumber,
  formatCost,
  formatLatency,
  formatTokens,
  successRatePercent,
} from "../../../utils/requests"
import { routes } from "../../../utils/navigation"

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "billing_month", label: "This month" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
]

const AnalyticsSkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy="true" role="status">
    <span className="sr-only">Loading analytics…</span>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
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

const formatRangeStart = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

const Analytics = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()

  const [range, setRange] = useState<AnalyticsRange>("billing_month")

  const missingContext = !projectId
    ? "Missing project"
    : !token
      ? "Not authenticated"
      : null

  const analyticsQuery = useQuery({
    ...projectAnalyticsQuery(token ?? "", projectId ?? "", range),
    enabled: !missingContext,
    placeholderData: (previous) =>
      previous?.project.id === projectId ? previous : undefined,
  })
  const data = analyticsQuery.data
  const isLoading = analyticsQuery.isLoading
  const isRefreshing = analyticsQuery.isPlaceholderData

  const shownError = missingContext ?? analyticsQuery.error?.message ?? null

  const period = data?.period
  const daily = useMemo(() => data?.daily ?? [], [data?.daily])
  const rate = period
    ? successRatePercent(period.successfulRequests, period.failedRequests)
    : null

  const requestSeries = useMemo(() => daily.map((d) => d.requestsUsed), [daily])
  const tokenSeries = useMemo(() => daily.map((d) => d.tokensUsed), [daily])
  const successSeries = useMemo(
    () =>
      daily.map((d) => {
        const total = d.successfulRequests + d.failedRequests
        return total > 0 ? Math.round((d.successfulRequests / total) * 100) : 0
      }),
    [daily],
  )

  const requestsPerDay =
    daily.length > 0 ? Math.round((period?.requestsUsed ?? 0) / daily.length) : 0
  const orgRequests = data?.organizationPeriod.requestsUsed ?? 0
  const workspaceShare =
    orgRequests > 0
      ? Math.round(((period?.requestsUsed ?? 0) / orgRequests) * 100)
      : null
  const costPerRequest =
    period && period.requestsUsed > 0
      ? (Number(period.totalCost) / period.requestsUsed).toString()
      : null

  const modelShareItems = useMemo(
    () =>
      (data?.byModel ?? []).map((row) => ({
        id: String(row.modelId),
        name: row.model,
        value: row.tokensUsed,
      })),
    [data?.byModel],
  )

  const apiKeyShareItems = useMemo(
    () =>
      (data?.byApiKey ?? []).map((row) => ({
        id: row.apiKeyId,
        name: row.keyPrefix ? `${row.keyName} · ${row.keyPrefix}` : row.keyName,
        value: row.requestsUsed,
        href: projectId ? routes.projectApiKeys(projectId) : undefined,
      })),
    [data?.byApiKey, projectId],
  )

  return (
    <WorkspacePage
      title="Analytics"
      description="Traffic, tokens, latency, and cost for this project, broken down by model and API key."
    >
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Date range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
        />
        {period ? (
          <p className="text-xs text-neutral-400">
            Since {formatRangeStart(period.periodStart)} (UTC)
          </p>
        ) : null}
      </div>

      {shownError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          {shownError}
        </p>
      ) : null}

      {isLoading && !data ? (
        <AnalyticsSkeleton />
      ) : data ? (
        <div
          className={[
            "flex flex-col gap-3 transition-opacity",
            isRefreshing ? "opacity-60" : "",
          ].join(" ")}
          aria-busy={isRefreshing}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SparkMetricChip
              label="Requests"
              value={formatCompactNumber(period?.requestsUsed ?? 0)}
              hint={[
                `~${formatCompactNumber(requestsPerDay)}/day`,
                workspaceShare != null ? `${workspaceShare}% of workspace` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              series={requestSeries}
            />
            <SparkMetricChip
              label="Tokens"
              value={formatTokens(period?.tokensUsed ?? 0)}
              hint={`${formatTokens(period?.inputTokens ?? 0)} in · ${formatTokens(period?.outputTokens ?? 0)} out`}
              series={tokenSeries}
            />
            <SparkMetricChip
              label="Success rate"
              value={rate == null ? "—" : `${rate}%`}
              hint={
                period
                  ? `${formatCompactNumber(period.failedRequests)} failed or rejected`
                  : undefined
              }
              series={successSeries}
            />
            <SparkMetricChip
              label="Avg latency"
              value={formatLatency(data.latency.avg)}
              hint={`p50 ${formatLatency(data.latency.p50)} · p95 ${formatLatency(data.latency.p95)}`}
            />
            <SparkMetricChip
              label="Cost"
              value={formatCost(period?.totalCost)}
              hint={
                costPerRequest != null
                  ? `${formatCost(costPerRequest)} per request`
                  : "No billable traffic"
              }
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectTrafficChart
                range={data.range}
                daily={daily}
                dailyByModel={data.dailyByModel}
                dailyByApiKey={data.dailyByApiKey}
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

          <div className="grid gap-3 lg:grid-cols-2">
            <ShareBars
              title="Share of tokens by model"
              items={modelShareItems}
              formatValue={formatTokens}
            />
            <ShareBars
              title="Share of requests by API key"
              items={apiKeyShareItems}
              formatValue={formatCompactNumber}
            />
          </div>

          <section className="space-y-3">
            <h2 className="text-[15px] font-medium text-accent">
              Recent requests in range
            </h2>
            <RecentRequestsTable
              items={data.recentRequests}
              logsHref={projectId ? routes.projectLogs(projectId) : undefined}
              emptyDescription="No gateway calls for this project in the selected range."
            />
          </section>
        </div>
      ) : null}
    </WorkspacePage>
  )
}

export default Analytics
