import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
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

const BillingCheckout = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const { refresh } = useWorkspace()

  const orgId = searchParams.get("orgId") ?? ""
  const plan = searchParams.get("plan") ?? "pro"
  const resume = searchParams.get("resume") === "1"

  const returnUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("resume", "1")
    return url.toString()
  }, [])

  const [componentsSdkKey, setComponentsSdkKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!token || !orgId || plan !== "pro") {
      setError("Missing checkout context")
      return
    }

    let cancelled = false

    void (async () => {
      const cached = readCachedCheckout(orgId)
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
  }, [token, orgId, plan, returnUrl])

  const handleSuccess = useCallback(async () => {
    setCompleted(true)
    if (orgId) clearCachedCheckout(orgId)
    await refresh()
    navigate(routes.billing, { replace: true })
  }, [navigate, orgId, refresh])

  const handleFail = useCallback((message: string) => {
    setError(message)
  }, [])

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Complete payment"
        description="Pay with Xendit to activate Pro on this workspace."
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
          <p className="text-sm text-neutral-500">Preparing checkout…</p>
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
