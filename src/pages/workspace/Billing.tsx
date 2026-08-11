import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/common/Button"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import BillingService, { type OrgSubscription } from "../../services/BillingService"
import { routes } from "../../utils/navigation"

type PlanCard = {
  id: "free" | "pro" | "scale"
  name: string
  price: string
  priceNote?: string
  badge?: string
  summary: string
  features: string[]
  cta: string
  ctaDisabled?: boolean
  emphasized?: boolean
}

const plans: PlanCard[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    badge: "Included with Personal",
    summary: "Personal workspace only — enough to try the gateway.",
    features: [
      "Personal workspace only (Free cannot be used on extra orgs)",
      "50k tokens / 300 requests per month",
      "Cheap models only (freeEligible)",
      "Hard stop at monthly caps",
    ],
    cta: "Current baseline",
    ctaDisabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₱1,099",
    priceNote: "/mo",
    badge: "Fixed monthly",
    summary: "Indie and student plan with included limits per organization.",
    features: [
      "Unlimited additional orgs (each on its own plan)",
      "2M tokens / 5k requests per org per month",
      "All catalog models",
      "Hard stop at cap (no overage)",
    ],
    cta: "Upgrade to Pro",
    emphasized: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "Custom",
    priceNote: " · metered",
    badge: "Usage-based",
    summary: "Metered pricing for teams that need headroom.",
    features: [
      "Unlimited additional orgs (each on its own plan)",
      "Usage-based / contact sales",
      "All catalog models",
      "Optional safety ceilings when configured",
    ],
    cta: "Contact sales",
    ctaDisabled: true,
  },
]

const Billing = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { activeOrganizationId } = useWorkspace()
  const [subscription, setSubscription] = useState<OrgSubscription | null>(null)

  useEffect(() => {
    if (!token || !activeOrganizationId) return
    void BillingService.getSubscription(token, activeOrganizationId).then(([data]) => {
      if (data) setSubscription(data)
    })
  }, [token, activeOrganizationId])

  const currentPlanId = subscription?.planName as PlanCard["id"] | undefined
  const isProActive = subscription?.planName === "pro" && subscription.status === "ACTIVE"
  const isProPending =
    subscription?.pendingPlanName === "pro" ||
    (subscription?.planName === "pro" && subscription.status === "PENDING")

  const goToProCheckout = useCallback(() => {
    if (!activeOrganizationId) return
    navigate(`${routes.billingCheckout(activeOrganizationId)}`)
  }, [activeOrganizationId, navigate])

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Billing"
        description="Plans and limits for organizations. Pro checkout is powered by Xendit."
      >
        {subscription ? (
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            Current workspace:{" "}
            <span className="font-medium text-accent capitalize">
              {subscription.planName}
            </span>
            {subscription.status !== "ACTIVE" ? ` (${subscription.status.toLowerCase()})` : ""}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <section
              key={plan.id}
              className={[
                "flex flex-col rounded-2xl border bg-white p-5 dark:bg-neutral-900",
                plan.emphasized
                  ? "border-accent/30 dark:border-accent/40"
                  : "border-neutral-200/80 dark:border-neutral-700",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-accent">{plan.name}</h2>
                {plan.badge ? (
                  <span className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 flex items-baseline gap-0.5">
                <span className="text-2xl font-semibold tracking-tight text-accent">
                  {plan.price}
                </span>
                {plan.priceNote ? (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {plan.priceNote}
                  </span>
                ) : null}
              </p>

              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {plan.summary}
              </p>

              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {plan.id === "pro" ? (
                  <Button
                    type="button"
                    disabled={isProActive}
                    onClick={goToProCheckout}
                    className="w-full !py-2.5 text-sm"
                  >
                    {isProActive
                      ? "Current plan"
                      : isProPending
                        ? "Complete payment"
                        : plan.cta}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={plan.ctaDisabled || currentPlanId === plan.id}
                    className="w-full !py-2.5 text-sm"
                  >
                    {currentPlanId === plan.id && plan.id === "free"
                      ? "Current plan"
                      : plan.cta}
                  </Button>
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-4 max-w-2xl text-xs text-neutral-400">
          Pro payments use Xendit Components on this site. Entitlements activate after
          Xendit confirms payment via webhook.
        </p>
      </WorkspacePage>
    </main>
  )
}

export default Billing
