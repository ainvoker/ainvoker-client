import type { UsageRangeSelection } from "../services/UsageService"

/** "2026-10" → "October 2026". */
export function formatMonthKey(month: string): string {
  const [year, m] = month.split("-").map(Number)
  return new Date(Date.UTC(year!, m! - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** Short label for the active range, e.g. for metric hints. */
export function rangeHint(selection: UsageRangeSelection): string {
  if (selection.range === "calendar_month" && selection.month) {
    return formatMonthKey(selection.month)
  }
  if (selection.range === "custom") return "Custom range"
  if (selection.range === "7d") return "Last 7 days"
  if (selection.range === "30d") return "Last 30 days"
  return "Current billing period"
}
