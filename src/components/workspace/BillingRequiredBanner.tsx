import { Link } from "react-router-dom"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import { routes } from "../../utils/navigation"

/**
 * Shown when the active workspace has no ACTIVE subscription (e.g. PENDING Pro).
 */
const BillingRequiredBanner = () => {
  const {
    activeOrganization,
    activeOrganizationId,
    subscription,
    isSubscriptionLoading,
    canMutateResources,
  } = useWorkspace()

  if (!activeOrganizationId || isSubscriptionLoading || canMutateResources) {
    return null
  }

  const pendingPro =
    subscription?.pendingPlanName === "pro" ||
    (subscription?.planName === "pro" && subscription.status === "PENDING")

  return (
    <div className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 md:px-5 lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {pendingPro
            ? `${activeOrganization?.name ?? "This workspace"} needs an active Pro subscription before you can create projects or API keys.`
            : `${activeOrganization?.name ?? "This workspace"} has no active plan. Complete billing to create projects or API keys.`}
        </p>
        <Link
          to={routes.billingCheckout(activeOrganizationId)}
          className="shrink-0 font-medium text-amber-900 underline-offset-2 hover:underline dark:text-amber-200"
        >
          Continue to checkout
        </Link>
      </div>
    </div>
  )
}

export default BillingRequiredBanner
