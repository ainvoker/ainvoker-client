import { useState, type ReactNode } from "react"
import type {
  AnalyticsRange,
  UsageRangeSelection,
} from "../../services/UsageService"
import { formatMonthKey } from "../../utils/usageRange"
import DateRangeCalendar from "./DateRangeCalendar"
import SegmentedControl from "./SegmentedControl"

const MODE_LABELS: Record<AnalyticsRange, string> = {
  current_period: "Current plan",
  "7d": "This week",
  "30d": "Last 30 days",
  calendar_month: "Month",
  custom: "Custom",
}

const FIELD_CLASS =
  "rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[13px] text-accent tabular-nums outline-none [color-scheme:light] focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:[color-scheme:dark]"

type UsageRangePickerProps = {
  value: UsageRangeSelection
  onChange: (next: UsageRangeSelection) => void
  /** UTC `YYYY-MM` months with a subscription, newest first. */
  availableMonths: string[]
  modes: AnalyticsRange[]
  /** Shown beside the month field, under the mode buttons; custom mode shows its own dates. */
  windowLabel?: ReactNode
}

const UsageRangePicker = ({
  value,
  onChange,
  availableMonths,
  modes,
  windowLabel,
}: UsageRangePickerProps) => {
  const [mode, setMode] = useState<AnalyticsRange>(value.range)

  const options = modes
    .filter((m) => m !== "calendar_month" || availableMonths.length > 0)
    .map((m) => ({ value: m, label: MODE_LABELS[m] }))
  const month = value.month ?? availableMonths[0]
  const appliedCustom = value.range === "custom"

  const selectMode = (next: AnalyticsRange) => {
    setMode(next)
    if (next === "calendar_month") {
      onChange({ range: next, month })
    } else if (next !== "custom") {
      onChange({ range: next })
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <SegmentedControl
        label="Date range"
        options={options}
        value={mode}
        onChange={selectMode}
      />
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {mode === "calendar_month" && month ? (
          <select
            aria-label="Month"
            className={FIELD_CLASS}
            value={month}
            onChange={(e) =>
              onChange({ range: "calendar_month", month: e.target.value })
            }
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthKey(m)}
              </option>
            ))}
          </select>
        ) : null}
        {mode === "custom" ? (
          <DateRangeCalendar
            from={appliedCustom ? value.from : undefined}
            to={appliedCustom ? value.to : undefined}
            onApply={(from, to) => onChange({ range: "custom", from, to })}
          />
        ) : null}
        {mode === "custom" ? null : windowLabel}
      </div>
    </div>
  )
}

export default UsageRangePicker
