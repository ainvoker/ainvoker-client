export const formatRequestDate = (value: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export const formatRequestStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  if (!normalized) return "—"
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const requestStatusClass = (status: string) => {
  const normalized = status.trim().toUpperCase()
  if (normalized === "SUCCESS") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
  }
  if (normalized === "FAILED" || normalized === "REJECTED") {
    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
  }
  if (normalized === "PENDING") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
  }
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
}

export const formatLatency = (ms: number | null) => {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export const formatTokens = (value: number | null | undefined) => {
  if (value == null) return "—"
  return value.toLocaleString()
}

export const formatCompactNumber = (value: number) => value.toLocaleString()

export const successRatePercent = (
  successful: number,
  failed: number,
): number | null => {
  const total = successful + failed
  if (total <= 0) return null
  return Math.round((successful / total) * 100)
}
