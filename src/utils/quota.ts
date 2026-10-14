import type { UsagePlanSnapshot } from "../services/UsageService"
import { formatCompactNumber, formatTokens } from "./requests"

export type QuotaResource = "requests" | "tokens"

export type BindingQuota = {
  resource: QuotaResource
  used: number
  limit: number
  remaining: number
  percentUsed: number
  unlimited: boolean
}

export type PaceStatus = "on_pace" | "over_pace" | "no_limit" | "empty"

export type PaceInsight = {
  status: PaceStatus
  daysElapsed: number
  daysInPeriod: number
  daysLeft: number
  evenPaceToday: number
  cumulativeToday: number
  etaLabel: string | null
}

export type PeriodBounds = { periodStart: string; periodEnd: string }

const WARNING_PCT = 70
const CRITICAL_PCT = 90
const DAY_MS = 86_400_000

function utcDayStart(ms: number): number {
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** UTC calendar days touched by a window (`periodEnd` exclusive). */
export function windowDayCount({ periodStart, periodEnd }: PeriodBounds): number {
  const first = utcDayStart(Date.parse(periodStart))
  const last = utcDayStart(Date.parse(periodEnd) - 1)
  return Math.max(1, Math.round((last - first) / DAY_MS) + 1)
}

/** Format a window as "Oct 15, 2026 – Nov 14, 2026" in UTC. */
export function formatWindowLabel({ periodStart, periodEnd }: PeriodBounds): string {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  return `${fmt(Date.parse(periodStart))} – ${fmt(Date.parse(periodEnd) - 1)}`
}

/** Explains why a pending or lapsed plan has no quota; null when entitled. */
export function inactivePlanSentence(plan: UsagePlanSnapshot | null): string | null {
  if (!plan || plan.entitled) return null
  return plan.status === "PENDING"
    ? "Complete checkout to activate this plan's quota."
    : "This plan has ended. Renew to restore quota."
}

export function barPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

/** Whichever of requests/tokens is closer to its ceiling (binding constraint). */
export function resolveBindingQuota(
  requestsUsed: number,
  tokensUsed: number,
  plan: UsagePlanSnapshot | null,
): BindingQuota {
  if (plan && !plan.entitled) {
    return {
      resource: "tokens",
      used: 0,
      limit: 0,
      remaining: 0,
      percentUsed: 0,
      unlimited: false,
    }
  }

  const requestLimit = plan?.requestLimit ?? 0
  const tokenLimit = plan?.tokenLimit ?? 0
  const requestsUnlimited = requestLimit <= 0
  const tokensUnlimited = tokenLimit <= 0

  if (requestsUnlimited && tokensUnlimited) {
    return {
      resource: "requests",
      used: requestsUsed,
      limit: 0,
      remaining: 0,
      percentUsed: 0,
      unlimited: true,
    }
  }

  const requestPct = requestsUnlimited
    ? -1
    : requestsUsed / Math.max(requestLimit, 1)
  const tokenPct = tokensUnlimited ? -1 : tokensUsed / Math.max(tokenLimit, 1)

  const useTokens =
    !tokensUnlimited && (requestsUnlimited || tokenPct >= requestPct)

  if (useTokens) {
    return {
      resource: "tokens",
      used: tokensUsed,
      limit: tokenLimit,
      remaining: Math.max(0, tokenLimit - tokensUsed),
      percentUsed: barPercent(tokensUsed, tokenLimit),
      unlimited: false,
    }
  }

  return {
    resource: "requests",
    used: requestsUsed,
    limit: requestLimit,
    remaining: Math.max(0, requestLimit - requestsUsed),
    percentUsed: barPercent(requestsUsed, requestLimit),
    unlimited: false,
  }
}

export function secondaryResource(
  binding: BindingQuota,
  requestsUsed: number,
  tokensUsed: number,
  plan: UsagePlanSnapshot | null,
): BindingQuota {
  const other: QuotaResource =
    binding.resource === "requests" ? "tokens" : "requests"
  const used = other === "requests" ? requestsUsed : tokensUsed
  const limit =
    other === "requests" ? (plan?.requestLimit ?? 0) : (plan?.tokenLimit ?? 0)
  const unlimited = limit <= 0
  return {
    resource: other,
    used,
    limit,
    remaining: unlimited ? 0 : Math.max(0, limit - used),
    percentUsed: barPercent(used, limit),
    unlimited,
  }
}

export function evenPaceAtDay(limit: number, dayIndex: number, daysInPeriod: number) {
  if (limit <= 0 || daysInPeriod <= 0) return 0
  return (limit * dayIndex) / daysInPeriod
}

/** Pace of quota usage within the current billing period. */
export function computePaceInsight(
  binding: BindingQuota,
  period: PeriodBounds | null,
  now = new Date(),
): PaceInsight {
  const daysInPeriod = period ? windowDayCount(period) : 1
  const daysElapsed = period
    ? Math.min(
        daysInPeriod,
        Math.max(
          1,
          Math.round(
            (utcDayStart(now.getTime()) -
              utcDayStart(Date.parse(period.periodStart))) /
              DAY_MS,
          ) + 1,
        ),
      )
    : 1
  const daysLeft = period
    ? Math.max(0, Math.ceil((Date.parse(period.periodEnd) - now.getTime()) / DAY_MS))
    : 0
  const cumulativeToday = binding.used
  const evenPaceToday = evenPaceAtDay(binding.limit, daysElapsed, daysInPeriod)

  if (binding.unlimited) {
    return {
      status: "no_limit",
      daysElapsed,
      daysInPeriod,
      daysLeft,
      evenPaceToday: 0,
      cumulativeToday,
      etaLabel: null,
    }
  }

  if (cumulativeToday <= 0) {
    return {
      status: "empty",
      daysElapsed,
      daysInPeriod,
      daysLeft,
      evenPaceToday,
      cumulativeToday: 0,
      etaLabel: null,
    }
  }

  const overPace = cumulativeToday > evenPaceToday
  let etaLabel: string | null = null

  if (overPace && daysElapsed > 0) {
    const dailyAvg = cumulativeToday / daysElapsed
    if (dailyAvg > 0) {
      const daysUntilExhausted = binding.remaining / dailyAvg
      if (Number.isFinite(daysUntilExhausted) && daysUntilExhausted >= 0) {
        const eta = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + Math.ceil(daysUntilExhausted),
          ),
        )
        etaLabel = eta.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      }
    }
  }

  return {
    status: overPace ? "over_pace" : "on_pace",
    daysElapsed,
    daysInPeriod,
    daysLeft,
    evenPaceToday,
    cumulativeToday,
    etaLabel,
  }
}

export function quotaToneClass(percentUsed: number, unlimited: boolean): string {
  if (unlimited) return "bg-accent"
  if (percentUsed >= CRITICAL_PCT) return "bg-red-500"
  if (percentUsed >= WARNING_PCT) return "bg-amber-500"
  return "bg-accent"
}

export function isQuotaElevated(percentUsed: number, unlimited: boolean): boolean {
  return !unlimited && percentUsed >= WARNING_PCT
}

export function formatQuotaValue(resource: QuotaResource, value: number): string {
  return resource === "tokens" ? formatTokens(value) : formatCompactNumber(value)
}

export function resourceLabel(resource: QuotaResource): string {
  return resource === "tokens" ? "Tokens" : "Requests"
}

export function remainingLabel(resource: QuotaResource): string {
  return resource === "tokens" ? "Tokens remaining" : "Requests remaining"
}

export function paceSentence(
  binding: BindingQuota,
  pace: PaceInsight,
): string {
  if (binding.unlimited) {
    return "No plan limit on this resource"
  }
  if (pace.status === "empty") {
    return "No traffic this billing period. Remaining quota is unused."
  }
  if (pace.status === "over_pace" && pace.etaLabel) {
    return `At this rate, ${binding.resource} run out around ${pace.etaLabel}.`
  }
  if (pace.status === "over_pace") {
    return "Over pace for this billing period"
  }
  return "On pace for this billing period"
}
