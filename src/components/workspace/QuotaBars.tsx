import { Link } from "react-router-dom"
import type { UsagePlanSnapshot } from "../../services/UsageService"
import { formatCompactNumber, formatTokens } from "../../utils/requests"
import { routes } from "../../utils/navigation"

type QuotaBarsProps = {
  plan: UsagePlanSnapshot | null
  requestsUsed: number
  tokensUsed: number
  showBillingCta?: boolean
}

const barPercent = (used: number, limit: number) => {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

const QuotaBar = ({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) => {
  const pct = barPercent(used, limit)
  const unlimited = limit <= 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-neutral-600 dark:text-neutral-300">{label}</span>
        <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
          {unlimited
            ? `${formatCompactNumber(used)} used`
            : `${formatCompactNumber(used)} / ${formatCompactNumber(limit)}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={[
            "h-full rounded-full transition-[width]",
            pct >= 90
              ? "bg-red-500"
              : pct >= 70
                ? "bg-amber-500"
                : "bg-accent",
          ].join(" ")}
          style={{ width: unlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  )
}

const QuotaBars = ({
  plan,
  requestsUsed,
  tokensUsed,
  showBillingCta = true,
}: QuotaBarsProps) => {
  const inactive =
    !plan ||
    (plan.status !== "ACTIVE" && plan.status !== "PAST_DUE") ||
    (plan.expiresAt != null &&
      !Number.isNaN(Date.parse(plan.expiresAt)) &&
      Date.parse(plan.expiresAt) <= Date.now())

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-accent">Plan usage</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {plan
              ? `${plan.planName} · ${plan.status}${
                  plan.expiresAt
                    ? ` · expires ${new Date(plan.expiresAt).toLocaleDateString()}`
                    : ""
                }`
              : "No active plan on this workspace"}
          </p>
        </div>
        {showBillingCta && inactive ? (
          <Link
            to={routes.billing}
            className="shrink-0 text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Manage billing
          </Link>
        ) : null}
      </div>

      {!plan ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Complete billing to unlock plan limits and create projects or API keys.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <QuotaBar
            label="Requests this month"
            used={requestsUsed}
            limit={plan.requestLimit}
          />
          <QuotaBar
            label="Tokens this month"
            used={tokensUsed}
            limit={plan.tokenLimit}
          />
          <p className="text-xs text-neutral-400">
            Period usage: {formatTokens(requestsUsed)} requests ·{" "}
            {formatTokens(tokensUsed)} tokens
          </p>
        </div>
      )}
    </section>
  )
}

export default QuotaBars
