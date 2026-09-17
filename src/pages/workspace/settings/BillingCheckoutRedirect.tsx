import { Navigate, useSearchParams } from "react-router-dom"

/** Preserve checkout query params when redirecting legacy /billing/checkout. */
const BillingCheckoutRedirect = () => {
  const [params] = useSearchParams()
  const search = params.toString()
  return (
    <Navigate
      to={`/settings/billing/checkout${search ? `?${search}` : ""}`}
      replace
    />
  )
}

export default BillingCheckoutRedirect
