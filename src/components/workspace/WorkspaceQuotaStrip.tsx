import { Link } from "react-router-dom"
import type {
  UsageDailyPoint,
  UsagePeriod,
  UsagePlanSnapshot,
} from "../../services/UsageService"
import {
  computePaceInsight,
  formatQuotaValue,
  isQuotaElevated,
  paceSentence,
  remainingLabel,
  resolveBindingQuota,
} from "../../utils/quota"
import { routes } from "../../utils/navigation"

type WorkspaceQuotaStripProps = {
  plan: UsagePlanSnapshot | null
  organizationPeriod: UsagePeriod | null
  organizationDaily: UsageDailyPoint[]
  /** This project's share of workspace requests (0–100), or null if unknown. */
  projectSharePercent: number | null
}

const WorkspaceQuotaStrip = ({
  plan,
  organizationPeriod,
  organizationDaily,
  projectSharePercent,
}: WorkspaceQuotaStripProps) => {
  const requestsUsed = organizationPeriod?.requestsUsed ?? 0
  const tokensUsed = organizationPeriod?.tokensUsed ?? 0
  const binding = resolveBindingQuota(requestsUsed, tokensUsed, plan)
  const pace = computePaceInsight(organizationDaily, binding)
  const sentence = paceSentence(binding, pace)
  const elevated = isQuotaElevated(binding.percentUsed, binding.unlimited)
  const noPlan = !plan

  const remainingText = binding.unlimited
    ? formatQuotaValue(binding.resource, binding.used)
    : formatQuotaValue(binding.resource, binding.remaining)

  const remainingHint = binding.unlimited
    ? `${remainingLabel(binding.resource).replace(" remaining", "")} this month`
    : remainingLabel(binding.resource)

  const linkTo = noPlan || elevated ? routes.billing : routes.dashboard
  const linkLabel = noPlan
    ? "Manage billing"
    : elevated
      ? "Review billing"
      : "Workspace dashboard"

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white px-3.5 py-2.5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 space-y-0.5 text-sm">
          <p className="text-accent">
            <span className="font-medium tabular-nums">{remainingText}</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {" "}
              {remainingHint.toLowerCase()}
            </span>
            {!binding.unlimited ? (
              <span className="text-neutral-400">
                {" "}
                · {binding.percentUsed}% used
              </span>
            ) : null}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {noPlan
              ? "No active plan on this workspace"
              : [
                  sentence,
                  projectSharePercent != null
                    ? `This project is ${projectSharePercent}% of workspace requests`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </p>
        </div>
        <Link
          to={linkTo}
          className="shrink-0 text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          {linkLabel}
        </Link>
      </div>
      {!binding.unlimited && plan ? (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={[
              "h-full rounded-full transition-[width]",
              elevated
                ? binding.percentUsed >= 90
                  ? "bg-red-500"
                  : "bg-amber-500"
                : "bg-accent",
            ].join(" ")}
            style={{ width: `${binding.percentUsed}%` }}
          />
        </div>
      ) : null}
    </section>
  )
}

export default WorkspaceQuotaStrip
