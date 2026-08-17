import type { CheckoutSession } from "../services/BillingService"

const STORAGE_PREFIX = "ainvoker.checkout.v2."

type CachedCheckout = CheckoutSession & { orgId: string }

function storageKey(orgId: string) {
  return `${STORAGE_PREFIX}${orgId}`
}

export function readCachedCheckout(orgId: string): CheckoutSession | null {
  try {
    const raw = sessionStorage.getItem(storageKey(orgId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedCheckout
    if (parsed.orgId !== orgId || !parsed.componentsSdkKey || !parsed.sessionId) {
      return null
    }
    if (parsed.expiresAt && Date.parse(parsed.expiresAt) <= Date.now()) {
      sessionStorage.removeItem(storageKey(orgId))
      return null
    }
    return {
      componentsSdkKey: parsed.componentsSdkKey,
      sessionId: parsed.sessionId,
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

export function writeCachedCheckout(orgId: string, session: CheckoutSession) {
  try {
    const payload: CachedCheckout = { ...session, orgId }
    sessionStorage.setItem(storageKey(orgId), JSON.stringify(payload))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearCachedCheckout(orgId: string) {
  try {
    sessionStorage.removeItem(storageKey(orgId))
  } catch {
    // ignore
  }
}
