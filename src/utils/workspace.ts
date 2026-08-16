export const ACTIVE_ORGANIZATION_STORAGE_KEY = "ainvoker.activeOrganizationId"

export const readStoredOrganizationId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_ORGANIZATION_STORAGE_KEY)
  } catch {
    return null
  }
}

export const writeStoredOrganizationId = (organizationId: string): void => {
  try {
    localStorage.setItem(ACTIVE_ORGANIZATION_STORAGE_KEY, organizationId)
  } catch {
    // Ignore quota / private-mode failures
  }
}

export const clearStoredOrganizationId = (): void => {
  try {
    localStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export const readOrganizationIdFromSearch = (
  search?: string,
): string | null => {
  try {
    const raw =
      search ?? (typeof window === "undefined" ? "" : window.location.search)
    const value = new URLSearchParams(raw).get("orgId")?.trim()
    return value ? value : null
  } catch {
    return null
  }
}

/** URL orgId wins on full page loads (checkout return), then localStorage. */
export const readInitialOrganizationId = (): string | null => {
  const fromUrl = readOrganizationIdFromSearch()
  if (fromUrl) {
    writeStoredOrganizationId(fromUrl)
    return fromUrl
  }
  return readStoredOrganizationId()
}

export const isPersonalWorkspace = (slug: string | undefined | null) =>
  Boolean(slug?.startsWith("personal-"))

/** Prefer Personal workspace, otherwise the first membership. */
export const pickDefaultOrganizationId = (
  organizations: { id: string; name: string; slug: string }[],
): string | null => {
  if (organizations.length === 0) return null

  const personal =
    organizations.find((org) => org.name === "Personal") ??
    organizations.find((org) => org.slug.startsWith("personal-"))

  return personal?.id ?? organizations[0]?.id ?? null
}
