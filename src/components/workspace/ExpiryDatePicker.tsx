import { useCallback, useEffect, useRef, useState } from "react"
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
  HiOutlineXMark,
} from "react-icons/hi2"
import { localDayKey as dayKey, parseLocalDay as parseDay } from "../../utils/apiKeyCapabilities"

type ExpiryDatePickerProps = {
  /** Local `YYYY-MM-DD`; the key expires at the end of that day. `null` means it never expires. */
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
]

const NAV_BUTTON_CLASS =
  "rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-accent disabled:pointer-events-none disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const formatDay = (key: string) =>
  parseDay(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const ExpiryDatePicker = ({ value, onChange, disabled }: ExpiryDatePickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const anchor = value ? parseDay(value) : new Date()
    return { year: anchor.getFullYear(), month: anchor.getMonth() }
  })

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [open, close])

  const now = new Date()
  const today = dayKey(now)
  const atCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth()

  const shiftMonths = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })

  const choose = (key: string | null) => {
    onChange(key)
    setOpen(false)
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      dayKey(new Date(view.year, view.month, i + 1)),
    ),
  ]
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-left text-sm text-accent tabular-nums transition-colors hover:border-neutral-400 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-500"
        >
          <HiOutlineCalendar className="size-4 text-neutral-400" aria-hidden />
          {value ? (
            <span>
              Expires {formatDay(value)}
              <span className="ml-1.5 text-neutral-400">end of day</span>
            </span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">Never expires</span>
          )}
        </button>
        {value ? (
          <button
            type="button"
            aria-label="Remove expiry"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="grid size-10 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent dark:hover:bg-neutral-800"
          >
            <HiOutlineXMark className="size-4" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose expiry date"
          className="absolute bottom-full left-0 z-30 mb-2 w-72 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => {
              const key = dayKey(addDays(now, preset.days))
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => choose(key)}
                  className={[
                    "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                    value === key
                      ? "border-accent bg-accent text-white dark:text-neutral-950"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-neutral-100",
                  ].join(" ")}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="Previous month"
              className={NAV_BUTTON_CLASS}
              disabled={atCurrentMonth}
              onClick={() => shiftMonths(-1)}
            >
              <HiChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="text-sm font-medium text-accent">{monthLabel}</p>
            <button
              type="button"
              aria-label="Next month"
              className={NAV_BUTTON_CLASS}
              onClick={() => shiftMonths(1)}
            >
              <HiChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-neutral-400">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((key, i) => {
              if (!key) return <span key={`blank-${i}`} />
              const selected = key === value
              const past = key < today
              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  aria-pressed={selected}
                  aria-label={formatDay(key)}
                  onClick={() => choose(key)}
                  className={[
                    "h-8 rounded-md text-[13px] tabular-nums transition-colors",
                    selected
                      ? "bg-accent font-medium text-white dark:text-neutral-950"
                      : past
                        ? "cursor-not-allowed text-neutral-300 dark:text-neutral-700"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    key === today && !selected ? "font-semibold underline underline-offset-4" : "",
                  ].join(" ")}
                >
                  {Number(key.slice(8))}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => choose(null)}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Never expires
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ExpiryDatePicker
