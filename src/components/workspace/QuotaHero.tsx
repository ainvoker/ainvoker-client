import { Link } from "react-router-dom"
import type {
  UsageDailyPoint,
  UsagePlanSnapshot,
} from "../../services/UsageService"
import {
  computePaceInsight,
  formatQuotaValue,
  isQuotaElevated,
  paceSentence,
  quotaToneClass,
  remainingLabel,
  resolveBindingQuota,
  secondaryResource,
  resourceLabel,
} from "../../utils/quota"
import { routes } from "../../utils/navigation"
import QuotaPaceChart from "./QuotaPaceChart"

export type QuotaHeroSegment = {
  id: string
  name: string
  value: number
  href?: string
}

type QuotaHeroProps = {
  plan: UsagePlanSnapshot | null
  requestsUsed: number
  tokensUsed: number
  daily: UsageDailyPoint[]
  paceDaily?: UsageDailyPoint[]
  subline?: string | null
  showBillingCta?: boolean
  /** Top share segments rendered under the chart (e.g. projects). */
  footerSegments?: QuotaHeroSegment[]
  formatSegmentValue?: (value: number) => string
}

const QuotaHero = ({
  plan,
  requestsUsed,
  tokensUsed,
  daily,
  paceDaily,
  subline,
  showBillingCta = true,
  footerSegments,
  formatSegmentValue = (v) => v.toLocaleString(),
}: QuotaHeroProps) => {
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
  const elevated = isQuotaElevated(binding.percentUsed, binding.unlimited)
  const splitSeries = paceDaily != null && paceDaily !== daily

  const inactive =
    !plan ||
    (plan.status !== "ACTIVE" && plan.status !== "PAST_DUE") ||
    (plan.expiresAt != null &&
      !Number.isNaN(Date.parse(plan.expiresAt)) &&
      Date.parse(plan.expiresAt) <= Date.now())

  const showBillingPrimary = showBillingCta && (inactive || elevated)

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
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Link
            to={routes.projects}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-accent transition hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
          >
            Projects
          </Link>
          {showBillingCta ? (
            showBillingPrimary ? (
              <Link
                to={routes.billing}
                className="inline-flex items-center justify-center rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:brightness-95 dark:text-neutral-950"
              >
                Manage billing
              </Link>
            ) : (
              <Link
                to={routes.billing}
                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-accent transition hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              >
                Billing
              </Link>
            )
          ) : null}
        </div>
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
            className="mt-5 -mx-1"
          />
          {splitSeries ? (
            <p className="mt-2 text-[11px] text-neutral-400">
              Chart shows this project&apos;s burn. Pace reflects the whole
              workspace.
            </p>
          ) : null}

          {topSegments.length > 0 && segmentTotal > 0 ? (
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
