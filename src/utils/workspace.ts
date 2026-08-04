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
