import type { ApiKeyPermissions } from "../services/ApiKeyService"

export type ApiKeyPermissionFeature = {
  id: string
  label: string
  description: string
}

export type ApiKeyPermissionCategory = {
  id: string
  label: string
  features: ApiKeyPermissionFeature[]
}

/** Mirrors the catalog in `ainvoker_api/src/modules/apiKeys/permissions.ts`. */
export const API_KEY_PERMISSION_CATEGORIES: ApiKeyPermissionCategory[] = [
  {
    id: "text",
    label: "Text",
    features: [
      { id: "text.chat", label: "Chat", description: "POST /v1/text/chat" },
      { id: "text.stream", label: "Stream", description: "POST /v1/text/stream" },
    ],
  },
  {
    id: "image",
    label: "Image",
    features: [
      { id: "image.generate", label: "Generate", description: "POST /v1/image/generate" },
    ],
  },
]

export const ALL_API_KEY_FEATURES = API_KEY_PERMISSION_CATEGORIES.flatMap((category) =>
  category.features.map((feature) => feature.id),
)

/** Expands stored scopes into the feature ids the picker works with. */
export const featuresFromPermissions = (permissions: ApiKeyPermissions | null): string[] => {
  if (!permissions) return ALL_API_KEY_FEATURES
  const scopes = new Set(permissions.scopes)
  return API_KEY_PERMISSION_CATEGORIES.flatMap((category) =>
    category.features
      .filter((feature) => scopes.has(category.id) || scopes.has(feature.id))
      .map((feature) => feature.id),
  )
}

/** Everything selected is stored as `null` (unrestricted); full categories are stored as the category. */
export const permissionsFromFeatures = (features: string[]): ApiKeyPermissions | null => {
  const selected = new Set(features)
  if (ALL_API_KEY_FEATURES.every((id) => selected.has(id))) return null
  const scopes = API_KEY_PERMISSION_CATEGORIES.flatMap((category) => {
    const ids = category.features.map((feature) => feature.id)
    if (ids.every((id) => selected.has(id))) return [category.id]
    return ids.filter((id) => selected.has(id))
  })
  return { scopes }
}

const pad = (n: number) => String(n).padStart(2, "0")

/** Local calendar day as `YYYY-MM-DD`. */
export const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const parseLocalDay = (key: string) => {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/** Keys expire at the end of the chosen local day. */
export const expiryDayToIso = (key: string) => {
  const date = parseLocalDay(key)
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

/** Short labels for the keys table, e.g. "All", "Image", "Text · Chat". */
export const permissionLabels = (permissions: ApiKeyPermissions | null): string[] => {
  if (!permissions) return ["All"]
  const scopes = new Set(permissions.scopes)
  return API_KEY_PERMISSION_CATEGORIES.flatMap((category) => {
    if (scopes.has(category.id)) return [category.label]
    return category.features
      .filter((feature) => scopes.has(feature.id))
      .map((feature) => `${category.label} · ${feature.label}`)
  })
}
