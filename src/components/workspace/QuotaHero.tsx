import { useState } from "react"
import { Link } from "react-router-dom"
import type {
  UsageDailyPoint,
  UsageDailySegmentPoint,
  UsagePlanSnapshot,
} from "../../services/UsageService"
import {
  computePaceInsight,
  formatQuotaValue,
  inactivePlanSentence,
  paceSentence,
  quotaToneClass,
  remainingLabel,
  resolveBindingQuota,
  secondaryResource,
  resourceLabel,
  windowDayCount,
  type PeriodBounds,
} from "../../utils/quota"
import QuotaPaceChart, { type QuotaPaceSeries } from "./QuotaPaceChart"
import SegmentedControl from "./SegmentedControl"

export type QuotaHeroSegment = {
  id: string
  name: string
  value: number
  href?: string
}

type ChartGroupBy = "total" | "project" | "model"

type QuotaHeroProps = {
  plan: UsagePlanSnapshot | null
  /** Usage in the current billing period (drives remaining quota and pace). */
  requestsUsed: number
  tokensUsed: number
  /** Selected range shown on the chart. */
  chartPeriod: PeriodBounds
  /** Whether the chart range is the current billing period (shows the pace line). */
  isCurrentPeriod: boolean
  daily: UsageDailyPoint[]
  dailyByProject?: UsageDailySegmentPoint[]
  dailyByModel?: UsageDailySegmentPoint[]
  subline?: string | null
  /** Top share segments rendered under the chart (e.g. projects). */
  footerSegments?: QuotaHeroSegment[]
  formatSegmentValue?: (value: number) => string
}

const SERIES_OPTIONS: { value: QuotaPaceSeries; label: string }[] = [
  { value: "cumulative", label: "Cumulative" },
  { value: "daily", label: "Daily" },
]

const GROUP_OPTIONS: { value: ChartGroupBy; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "project", label: "Project" },
  { value: "model", label: "Model" },
]

const QuotaHero = ({
  plan,
  requestsUsed,
  tokensUsed,
  chartPeriod,
  isCurrentPeriod,
  daily,
  dailyByProject,
  dailyByModel,
  subline,
  footerSegments,
  formatSegmentValue = (v) => v.toLocaleString(),
}: QuotaHeroProps) => {
  const [chartSeries, setChartSeries] = useState<QuotaPaceSeries>("cumulative")
  const [groupBy, setGroupBy] = useState<ChartGroupBy>("total")

  const binding = resolveBindingQuota(requestsUsed, tokensUsed, plan)
  const secondary = secondaryResource(
    binding,
    requestsUsed,
    tokensUsed,
    plan,
  )
  const quotaPeriod =
    plan?.periodStart && plan.periodEnd
      ? { periodStart: plan.periodStart, periodEnd: plan.periodEnd }
      : null
  const pace = computePaceInsight(binding, quotaPeriod)
  const sentence = inactivePlanSentence(plan) ?? paceSentence(binding, pace)
  const showPaceLine = isCurrentPeriod && binding.limit > 0
  const chartBinding = showPaceLine
    ? binding
    : { ...binding, limit: 0, remaining: 0, percentUsed: 0, unlimited: true }

  const heroValue = binding.unlimited
    ? formatQuotaValue(binding.resource, binding.used)
    : formatQuotaValue(binding.resource, binding.remaining)

  const heroLabel = binding.unlimited
    ? `${resourceLabel(binding.resource)} this billing period`
    : remainingLabel(binding.resource)

  const segmentTotal =
    footerSegments?.reduce((sum, s) => sum + s.value, 0) ?? 0
  const topSegments = (footerSegments ?? [])
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const breakdown =
    groupBy === "project"
      ? dailyByProject
      : groupBy === "model"
        ? dailyByModel
        : undefined

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-accent">{heroLabel}</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-accent md:text-5xl">
            {heroValue}
          </p>
          <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            {plan
              ? [
                  plan.planName,
                  binding.unlimited || !plan.entitled
                    ? null
                    : `Binding ${resourceLabel(binding.resource).toLowerCase()} limit`,
                  !quotaPeriod
                    ? null
                    : pace.daysLeft > 1
                      ? `${pace.daysLeft} days left in billing period`
                      : "Last day of billing period",
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "No active plan on this workspace"}
          </p>
          <p className="mt-1 text-sm text-accent">{sentence}</p>
          {subline ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subline}
            </p>
          ) : null}
        </div>
        {plan ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <SegmentedControl
              label="Chart series"
              options={SERIES_OPTIONS}
              value={chartSeries}
              onChange={setChartSeries}
            />
            <SegmentedControl
              label="Group by"
              options={GROUP_OPTIONS}
              value={groupBy}
              onChange={setGroupBy}
            />
          </div>
        ) : null}
      </div>

      {!plan ? (
        <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">
          Complete billing to unlock plan limits and create projects or API keys.
        </p>
      ) : (
        <>
          <QuotaPaceChart
            daily={daily}
            binding={chartBinding}
            showPaceLine={showPaceLine}
            totalDays={windowDayCount(chartPeriod)}
            startDate={chartPeriod.periodStart.slice(0, 10)}
            series={chartSeries}
            breakdown={breakdown}
            className="mt-5 -mx-1"
          />

          {topSegments.length > 0 && segmentTotal > 0 && groupBy === "total" ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {topSegments.map((seg) => {
                const pct = Math.round((seg.value / segmentTotal) * 100)
                const name = (
                  <span className="truncate text-sm font-medium text-accent">
                    {seg.name}
                  </span>
                )
                return (
                  <div key={seg.id} className="min-w-0 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      {seg.href ? (
                        <Link
                          to={seg.href}
                          className="min-w-0 truncate underline-offset-2 hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                      <span className="shrink-0 text-xs tabular-nums text-neutral-400">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] tabular-nums text-neutral-400">
                      {formatSegmentValue(seg.value)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : null}

          {!secondary.unlimited ? (
            <div className="mt-5 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-neutral-600 dark:text-neutral-300">
                  {remainingLabel(secondary.resource)}
                </span>
                <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                  {formatQuotaValue(secondary.resource, secondary.remaining)}{" "}
                  left
                  {" · "}
                  {formatQuotaValue(secondary.resource, secondary.used)} /{" "}
                  {formatQuotaValue(secondary.resource, secondary.limit)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={[
                    "h-full rounded-full transition-[width]",
                    quotaToneClass(secondary.percentUsed, secondary.unlimited),
                  ].join(" ")}
                  style={{ width: `${secondary.percentUsed}%` }}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

export default QuotaHero
