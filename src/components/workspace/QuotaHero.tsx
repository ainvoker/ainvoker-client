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
  paceSentence,
  quotaToneClass,
  remainingLabel,
  resolveBindingQuota,
  secondaryResource,
  resourceLabel,
} from "../../utils/quota"
import QuotaPaceChart, { type QuotaPaceSeries } from "./QuotaPaceChart"

export type QuotaHeroSegment = {
  id: string
  name: string
  value: number
  href?: string
}

type ChartWindow = "7d" | "14d" | "month"
type ChartGroupBy = "total" | "project" | "model"

type QuotaHeroProps = {
  plan: UsagePlanSnapshot | null
  requestsUsed: number
  tokensUsed: number
  daily: UsageDailyPoint[]
  paceDaily?: UsageDailyPoint[]
  dailyByProject?: UsageDailySegmentPoint[]
  dailyByModel?: UsageDailySegmentPoint[]
  subline?: string | null
  /** Top share segments rendered under the chart (e.g. projects). */
  footerSegments?: QuotaHeroSegment[]
  formatSegmentValue?: (value: number) => string
}

const WINDOW_OPTIONS: { value: ChartWindow; label: string }[] = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "month", label: "Month" },
]

const SERIES_OPTIONS: { value: QuotaPaceSeries; label: string }[] = [
  { value: "cumulative", label: "Cumulative" },
  { value: "daily", label: "Daily" },
]

const GROUP_OPTIONS: { value: ChartGroupBy; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "project", label: "Project" },
  { value: "model", label: "Model" },
]

function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
      role="group"
      aria-label={label}
    >
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
              selected
                ? "bg-accent text-white dark:text-neutral-950"
                : "text-neutral-500 hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100",
            ].join(" ")}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

const QuotaHero = ({
  plan,
  requestsUsed,
  tokensUsed,
  daily,
  paceDaily,
  dailyByProject,
  dailyByModel,
  subline,
  footerSegments,
  formatSegmentValue = (v) => v.toLocaleString(),
}: QuotaHeroProps) => {
  const [chartWindow, setChartWindow] = useState<ChartWindow>("month")
  const [chartSeries, setChartSeries] = useState<QuotaPaceSeries>("cumulative")
  const [groupBy, setGroupBy] = useState<ChartGroupBy>("total")

  const binding = resolveBindingQuota(requestsUsed, tokensUsed, plan)
  const secondary = secondaryResource(
    binding,
    requestsUsed,
    tokensUsed,
    plan,
  )
  const paceSeries = paceDaily ?? daily
  const pace = computePaceInsight(paceSeries, binding)
  const sentence = paceSentence(binding, pace)
  const splitSeries = paceDaily != null && paceDaily !== daily

  const heroValue = binding.unlimited
    ? formatQuotaValue(binding.resource, binding.used)
    : formatQuotaValue(binding.resource, binding.remaining)

  const heroLabel = binding.unlimited
    ? `${resourceLabel(binding.resource)} this month`
    : remainingLabel(binding.resource)

  const segmentTotal =
    footerSegments?.reduce((sum, s) => sum + s.value, 0) ?? 0
  const topSegments = (footerSegments ?? [])
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const windowDays =
    chartWindow === "7d" ? 7 : chartWindow === "14d" ? 14 : undefined

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
                  binding.unlimited
                    ? null
                    : `Binding ${resourceLabel(binding.resource).toLowerCase()} limit`,
                  pace.daysLeft > 0
                    ? `${pace.daysLeft} days left`
                    : "Last day of month",
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
              label="Chart time window"
              options={WINDOW_OPTIONS}
              value={chartWindow}
              onChange={setChartWindow}
            />
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
            binding={binding}
            showPaceLine={!splitSeries}
            windowDays={windowDays}
            series={chartSeries}
            breakdown={breakdown}
            className="mt-5 -mx-1"
          />
          {splitSeries ? (
            <p className="mt-2 text-[11px] text-neutral-400">
              Chart shows this project&apos;s burn. Pace reflects the whole
              workspace.
            </p>
          ) : null}

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
