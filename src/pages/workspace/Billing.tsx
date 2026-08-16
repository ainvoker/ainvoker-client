import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/common/Button"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import BillingService, {
  type InvoiceItem,
  type OrgSubscription,
} from "../../services/BillingService"
import UsageService, { type OrgUsageByModel } from "../../services/UsageService"
import { formatCompactNumber, formatTokens } from "../../utils/requests"
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
    priceNote: " / month",
    badge: "Auto-renews",
    summary:
      "Indie and student plan with included limits per organization. Billed monthly via Xendit until you cancel.",
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

const cardClass =
  "rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"

const formatDate = (value: string | null | undefined) => {
  if (!value || Number.isNaN(Date.parse(value))) return null
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatAmount = (amount: string, currency: string) => {
  const n = Number(amount)
  if (Number.isNaN(n)) return `${amount} ${currency}`
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${n.toFixed(2)} ${currency}`
  }
}

const invoiceStatusClass = (status: InvoiceItem["status"]) => {
  switch (status) {
    case "paid":
      return "text-emerald-600 dark:text-emerald-400"
    case "failed":
      return "text-red-600 dark:text-red-400"
    case "refunded":
      return "text-amber-600 dark:text-amber-400"
    default:
      return "text-neutral-500 dark:text-neutral-400"
  }
}

const Billing = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    activeOrganization,
    activeOrganizationId,
    isLoading,
    role,
    refreshSubscription,
  } = useWorkspace()

  const [subscription, setSubscription] = useState<OrgSubscription | null>(null)
  const [byModel, setByModel] = useState<OrgUsageByModel[]>([])
  const [periodTokens, setPeriodTokens] = useState(0)
  const [periodRequests, setPeriodRequests] = useState(0)
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [showPlans, setShowPlans] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const canManageBilling = role === "owner" || role === "admin"

  const reload = useCallback(async () => {
    if (!token || !activeOrganizationId) return
    setLoadError(null)

    const [sub, subErr] = await BillingService.getSubscription(
      token,
      activeOrganizationId,
    )
    if (sub) setSubscription(sub)
    if (subErr) setLoadError(subErr.message)

    const [usage] = await UsageService.getOrganizationUsage(
      token,
      activeOrganizationId,
    )
    if (usage) {
      setByModel(usage.byModel ?? [])
      setPeriodTokens(usage.period.tokensUsed)
      setPeriodRequests(usage.period.requestsUsed)
    }

    if (canManageBilling) {
      const [invoiceRows] = await BillingService.listInvoices(
        token,
        activeOrganizationId,
      )
      if (invoiceRows) setInvoices(invoiceRows)
    } else {
      setInvoices([])
    }
  }, [token, activeOrganizationId, canManageBilling])

  useEffect(() => {
    setSubscription(null)
    setByModel([])
    setInvoices([])
    setShowPlans(false)
    setCancelConfirm(false)
    void reload()
  }, [reload])

  const currentPlanId = subscription?.planName as PlanCard["id"] | undefined
  const periodEnd =
    (subscription?.renewsAt || subscription?.expiresAt) &&
    !Number.isNaN(Date.parse(subscription.renewsAt || subscription.expiresAt || ""))
      ? new Date(subscription.renewsAt || subscription.expiresAt || "")
      : null
  const isExpiredPeriod = Boolean(periodEnd && periodEnd.getTime() <= Date.now())
  const isProActive =
    subscription?.planName === "pro" &&
    (subscription.status === "ACTIVE" || subscription.status === "PAST_DUE") &&
    !isExpiredPeriod
  const isProPending =
    subscription?.pendingPlanName === "pro" ||
    (subscription?.planName === "pro" && subscription.status === "PENDING")
  const isProExpired =
    subscription?.planName === "pro" &&
    (subscription.status === "EXPIRED" ||
      (subscription.status === "ACTIVE" && isExpiredPeriod))
  const cancelAtPeriodEnd = Boolean(subscription?.cancelAtPeriodEnd && isProActive)
  const isPaidPlan =
    isProActive ||
    (subscription?.planName === "scale" &&
      subscription.status === "ACTIVE" &&
      !isExpiredPeriod)

  const goToProCheckout = useCallback(() => {
    if (!activeOrganizationId || isLoading) return
    navigate(routes.billingCheckout(activeOrganizationId))
  }, [activeOrganizationId, isLoading, navigate])

  const handleCancel = useCallback(async () => {
    if (!token || !activeOrganizationId || !canManageBilling) return
    setCanceling(true)
    setCancelError(null)
    const [result, err] = await BillingService.cancelSubscription(
      token,
      activeOrganizationId,
    )
    setCanceling(false)
    if (err || !result) {
      setCancelError(err?.message ?? "Could not cancel subscription")
      return
    }
    setCancelConfirm(false)
    await refreshSubscription()
    await reload()
  }, [
    token,
    activeOrganizationId,
    canManageBilling,
    refreshSubscription,
    reload,
  ])

  const paymentLabel = useMemo(() => {
    const pm = subscription?.paymentMethod
    if (!pm) return null
    const brand = pm.brand || pm.type || "Payment method"
    if (pm.last4) return `${brand} ···· ${pm.last4}`
    return brand
  }, [subscription?.paymentMethod])

  const tokenLimit = subscription?.tokenLimit ?? 0
  const requestLimit = subscription?.requestLimit ?? 0
  const tokenPct =
    tokenLimit > 0
      ? Math.min(100, Math.round((periodTokens / tokenLimit) * 100))
      : 0
  const requestPct =
    requestLimit > 0
      ? Math.min(100, Math.round((periodRequests / requestLimit) * 100))
      : 0

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Billing"
        description={
          activeOrganization
            ? `Plan, usage, and invoices for ${activeOrganization.name}.`
            : "Plan, usage, and invoices for this workspace."
        }
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {loadError}
            </div>
          ) : null}

          {/* Current plan */}
          <section className={cardClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-accent">Current plan</h2>
                {subscription ? (
                  <>
                    <p className="mt-2 text-2xl font-semibold tracking-tight capitalize text-accent">
                      {subscription.planName}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Status:{" "}
                      <span className="capitalize">
                        {isExpiredPeriod && subscription.status === "ACTIVE"
                          ? "expired"
                          : subscription.status.toLowerCase().replace("_", " ")}
                      </span>
                      {cancelAtPeriodEnd
                        ? ` · Cancels on ${formatDate(subscription.expiresAt)}`
                        : isProActive && periodEnd
                          ? ` · Renews on ${formatDate(subscription.renewsAt || subscription.expiresAt)}`
                          : periodEnd && !isExpiredPeriod
                            ? ` · Until ${formatDate(subscription.expiresAt)}`
                            : null}
                    </p>
                    {cancelAtPeriodEnd ? (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Auto-renew is off. You keep Pro until the end of this
                        billing period.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                    Loading plan…
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => setShowPlans((v) => !v)}
                className="shrink-0 !py-2.5 text-sm"
              >
                {showPlans ? "Hide plans" : "Adjust plan"}
              </Button>
            </div>

            {showPlans ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => (
                  <section
                    key={plan.id}
                    className={[
                      "flex flex-col rounded-xl border bg-neutral-50/80 p-4 dark:bg-neutral-950/40",
                      plan.emphasized
                        ? "border-accent/30 dark:border-accent/40"
                        : "border-neutral-200/80 dark:border-neutral-700",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-accent">
                        {plan.name}
                      </h3>
                      {plan.badge ? (
                        <span className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex items-baseline gap-0.5">
                      <span className="text-xl font-semibold tracking-tight text-accent">
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
                    <ul className="mt-3 flex flex-1 flex-col gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
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
                    <div className="mt-4">
                      {plan.id === "pro" ? (
                        <Button
                          type="button"
                          disabled={
                            isProActive || !activeOrganizationId || isLoading
                          }
                          onClick={goToProCheckout}
                          className="w-full !py-2 text-sm"
                        >
                          {isProActive
                            ? "Current plan"
                            : isProPending
                              ? "Complete payment"
                              : isProExpired
                                ? "Resubscribe to Pro"
                                : plan.cta}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={
                            plan.ctaDisabled || currentPlanId === plan.id
                          }
                          className="w-full !py-2 text-sm"
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
            ) : null}
          </section>

          {/* Payment method */}
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-accent">Payment method</h2>
            {paymentLabel ? (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                {paymentLabel}
              </p>
            ) : (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                No payment method on file.
                {canManageBilling && !isProActive
                  ? " Add one when you subscribe to Pro."
                  : null}
              </p>
            )}
            {canManageBilling && !isProActive ? (
              <Button
                type="button"
                onClick={goToProCheckout}
                disabled={!activeOrganizationId || isLoading}
                className="mt-4 !py-2 text-sm"
              >
                {isProPending ? "Complete payment" : "Add payment method"}
              </Button>
            ) : null}
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              Card and e-wallet details are stored securely with Xendit. We only
              keep a display snapshot (brand and last four digits).
            </p>
          </section>

          {/* Included usage */}
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-accent">Included usage</h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              UTC calendar month · tokens and requests across this workspace
            </p>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Tokens
                  </span>
                  <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                    {tokenLimit > 0
                      ? `${formatCompactNumber(periodTokens)} / ${formatCompactNumber(tokenLimit)} (${tokenPct}%)`
                      : `${formatCompactNumber(periodTokens)} used`}
                  </span>
                </div>
                {tokenLimit > 0 ? (
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={[
                        "h-full rounded-full",
                        tokenPct >= 90
                          ? "bg-red-500"
                          : tokenPct >= 70
                            ? "bg-amber-500"
                            : "bg-accent",
                      ].join(" ")}
                      style={{ width: `${tokenPct}%` }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Requests
                  </span>
                  <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                    {requestLimit > 0
                      ? `${formatCompactNumber(periodRequests)} / ${formatCompactNumber(requestLimit)} (${requestPct}%)`
                      : `${formatCompactNumber(periodRequests)} used`}
                  </span>
                </div>
                {requestLimit > 0 ? (
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={[
                        "h-full rounded-full",
                        requestPct >= 90
                          ? "bg-red-500"
                          : requestPct >= 70
                            ? "bg-amber-500"
                            : "bg-accent",
                      ].join(" ")}
                      style={{ width: `${requestPct}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-700">
              {byModel.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No model usage this month yet.
                </p>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3 font-medium">Tokens</th>
                      <th className="px-4 py-3 font-medium">Requests</th>
                      {subscription?.planName === "pro" ? (
                        <th className="px-4 py-3 font-medium">% of quota</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {byModel.map((row) => (
                      <tr
                        key={row.modelId}
                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                      >
                        <td className="px-4 py-3 font-medium text-accent">
                          {row.model}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                          {formatTokens(row.tokensUsed)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                          {formatCompactNumber(row.requestsUsed)}
                        </td>
                        {subscription?.planName === "pro" ? (
                          <td className="px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                            {row.percentOfTokenQuota != null
                              ? `${row.percentOfTokenQuota}%`
                              : "—"}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Invoices */}
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-accent">Invoices</h2>
            {!canManageBilling ? (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Only workspace owners and admins can view invoices.
              </p>
            ) : invoices.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                No invoices yet.
              </p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-neutral-600 dark:text-neutral-300">
                            {formatDate(invoice.date) ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                            {invoice.description}
                          </td>
                          <td
                            className={`px-4 py-3 capitalize ${invoiceStatusClass(invoice.status)}`}
                          >
                            {invoice.status}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums text-neutral-600 dark:text-neutral-300">
                            {formatAmount(invoice.amount, invoice.currency)}
                          </td>
                          <td className="px-4 py-3">
                            {invoice.receiptUrl ? (
                              <a
                                href={invoice.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-accent underline-offset-2 hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Cancel */}
          {isPaidPlan && canManageBilling ? (
            <section className="space-y-3 rounded-2xl border border-red-200/80 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Cancel subscription
              </h2>
              {cancelAtPeriodEnd ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Cancellation is scheduled. You keep Pro until{" "}
                  {formatDate(subscription?.expiresAt) ?? "the end of the period"}
                  . No further charges will be made.
                </p>
              ) : (
                <>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Stop auto-renew. You keep Pro until the end of the current
                    billing period
                    {periodEnd ? ` (${formatDate(subscription?.expiresAt)})` : ""}
                    . This does not refund the current period.
                  </p>
                  {cancelError ? (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {cancelError}
                    </p>
                  ) : null}
                  {!cancelConfirm ? (
                    <Button
                      type="button"
                      onClick={() => setCancelConfirm(true)}
                      className="!border-red-300 !bg-transparent !py-2 text-sm !text-red-600 hover:!bg-red-50 dark:!border-red-800 dark:!text-red-400 dark:hover:!bg-red-950/40"
                    >
                      Cancel Pro
                    </Button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={canceling}
                        onClick={() => void handleCancel()}
                        className="!bg-red-600 !py-2 text-sm hover:!bg-red-700"
                      >
                        {canceling ? "Canceling…" : "Confirm cancel"}
                      </Button>
                      <Button
                        type="button"
                        disabled={canceling}
                        onClick={() => {
                          setCancelConfirm(false)
                          setCancelError(null)
                        }}
                        className="!bg-transparent !py-2 text-sm !text-neutral-600 dark:!text-neutral-300"
                      >
                        Keep Pro
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : null}

          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Pro is ₱1,099 per month and auto-renews via Xendit until canceled.
            Entitlements update after Xendit confirms payment.
          </p>
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Billing
