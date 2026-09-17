/** Account row shape from Neon Auth / Better Auth `listAccounts`. */
export type AuthAccount = {
  id: string
  providerId: string
  accountId: string
  userId?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  scopes?: string[]
}

export type SignInProviderId = "credential" | "google" | "github"

const KNOWN_PROVIDERS: readonly SignInProviderId[] = [
  "credential",
  "google",
  "github",
]

export function hasPasswordFromAccounts(
  accounts: readonly AuthAccount[],
): boolean {
  return accounts.some((a) => a.providerId === "credential")
}

export function isProviderLinked(
  accounts: readonly AuthAccount[],
  providerId: string,
): boolean {
  return accounts.some((a) => a.providerId === providerId)
}

/** Unique known sign-in methods on the account. */
export function signInMethodCount(accounts: readonly AuthAccount[]): number {
  const methods = new Set<string>()
  for (const account of accounts) {
    if ((KNOWN_PROVIDERS as readonly string[]).includes(account.providerId)) {
      methods.add(account.providerId)
    }
  }
  return methods.size
}

/** False when unlinking would leave the user with zero sign-in methods. */
export function canUnlinkProvider(
  accounts: readonly AuthAccount[],
  providerId: string,
): boolean {
  if (!isProviderLinked(accounts, providerId)) return false
  return signInMethodCount(accounts) > 1
}

export function findAccountByProvider(
  accounts: readonly AuthAccount[],
  providerId: string,
): AuthAccount | undefined {
  return accounts.find((a) => a.providerId === providerId)
}

/** Map Better Auth / OAuth callback error codes into user-facing copy. */
export function formatAuthLinkError(raw: string | null | undefined): string | null {
  if (!raw) return null
  const normalized = raw.trim().toLowerCase()
  if (!normalized) return null

  if (
    normalized.includes("email") &&
    (normalized.includes("mismatch") ||
      normalized.includes("different") ||
      normalized.includes("not_match") ||
      normalized.includes("not match"))
  ) {
    return "That provider uses a different email than this account. Sign in with a matching verified email, or use another provider."
  }

  if (
    normalized.includes("account_already_linked") ||
    normalized.includes("already linked") ||
    normalized.includes("already_linked")
  ) {
    return "That provider is already linked to another account."
  }

  if (
    normalized.includes("unable_to_link") ||
    normalized.includes("unable to link")
  ) {
    return "Could not link that provider. The provider email must match this account and be verified."
  }

  // Decode URL-style codes like SOCIAL_ACCOUNT_ALREADY_LINKED
  const readable = raw
    .replace(/_/g, " ")
    .replace(/\+/g, " ")
    .trim()

  return readable.charAt(0).toUpperCase() + readable.slice(1)
}

export function formatUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent?.trim()) return "Unknown device"
  const ua = userAgent.trim()
  if (ua.length <= 72) return ua
  return `${ua.slice(0, 69)}…`
}

export function formatSessionDate(value: Date | string | null | undefined): string {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}
