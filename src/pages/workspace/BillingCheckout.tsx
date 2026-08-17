import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import InlineLoader from "../../components/common/InlineLoader"
import XenditCheckout from "../../components/billing/XenditCheckout"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import BillingService from "../../services/BillingService"
import {
  clearCachedCheckout,
  readCachedCheckout,
  writeCachedCheckout,
} from "../../utils/checkoutSessionCache"
import { routes } from "../../utils/navigation"
import { writeStoredOrganizationId } from "../../utils/workspace"

const BillingCheckout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, isLoading: authLoading } = useAuth()
  const { organizations, setActiveWorkspace, refresh } = useWorkspace()

  const orgId = searchParams.get("orgId")?.trim() ?? ""
  const plan = searchParams.get("plan") ?? "pro"
  const resume = searchParams.get("resume") === "1"
  const checkoutOrg =
    organizations.find((org) => org.id === orgId) ?? null

  const returnUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("resume", "1")
    return url.toString()
  }, [])

  const [componentsSdkKey, setComponentsSdkKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)

  useLayoutEffect(() => {
    if (!orgId) return
    writeStoredOrganizationId(orgId)
    setActiveWorkspace(orgId)
  }, [orgId, setActiveWorkspace])

  useEffect(() => {
    if (authLoading) return

    if (!token || !orgId || plan !== "pro") {
      setError("Missing checkout context")
      return
    }

    let cancelled = false
    setError(null)

    void (async () => {
      const cached = retryNonce === 0 ? readCachedCheckout(orgId) : null
      if (cached) {
        setComponentsSdkKey(cached.componentsSdkKey)
        return
      }

      const [session, err] = await BillingService.createCheckoutSession(token, orgId, {
        plan: "pro",
        returnUrl,
      })
      if (err || !session) {
        if (!cancelled) setError(err?.message ?? "Could not start checkout")
        return
      }
      writeCachedCheckout(orgId, session)
      if (cancelled) return
      setComponentsSdkKey(session.componentsSdkKey)
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, token, orgId, plan, returnUrl, retryNonce])

  const handleSuccess = useCallback(async () => {
    setCompleted(true)
    if (orgId) {
      clearCachedCheckout(orgId)
      writeStoredOrganizationId(orgId)
      setActiveWorkspace(orgId)
    }
    await refresh()
    navigate(routes.billing, { replace: true })
  }, [navigate, orgId, refresh, setActiveWorkspace])

  const handleFail = useCallback((message: string) => {
    const staleSchedule = /anchor_date/i.test(message)
    if (staleSchedule && orgId && retryNonce < 1) {
      clearCachedCheckout(orgId)
      setComponentsSdkKey(null)
      setRetryNonce((n) => n + 1)
      return
    }
    setError(message)
  }, [orgId, retryNonce])

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Complete payment"
        description={
          checkoutOrg
            ? `Subscribe to Pro on ${checkoutOrg.name} for ₱1,099 / month. Auto-renews until you cancel.`
            : "Subscribe to Pro for ₱1,099 / month. Auto-renews until you cancel."
        }
      >
        {completed ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Payment complete. Redirecting…
          </p>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {componentsSdkKey && !completed ? (
          <XenditCheckout
            componentsSdkKey={componentsSdkKey}
            resume={resume}
            onSuccess={() => void handleSuccess()}
            onFail={handleFail}
          />
        ) : null}

        {!componentsSdkKey && !error && !completed ? (
          <InlineLoader label="Preparing checkout…" className="py-2" />
        ) : null}

        <p className="mt-6 text-sm">
          <Link to={routes.billing} className="text-accent underline-offset-2 hover:underline">
            Back to billing
          </Link>
        </p>
      </WorkspacePage>
    </main>
  )
}

export default BillingCheckout
