import { useCallback, useEffect, useRef, useState } from "react"
import {
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
} from "react-icons/hi2"

type DateRangeCalendarProps = {
  /** Applied range (`YYYY-MM-DD`, UTC), if any. */
  from?: string
  to?: string
  onApply: (from: string, to: string) => void
}

type Points = [string | null, string | null]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const NAV_BUTTON_CLASS =
  "rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-accent dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"

function dayKey(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
}

function formatDay(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function sortedRange(points: Points): { start: string | null; end: string | null } {
  const [a, b] = points
  if (!a || !b) return { start: a ?? b, end: null }
  return a <= b ? { start: a, end: b } : { start: b, end: a }
}

const DateRangeCalendar = ({ from, to, onApply }: DateRangeCalendarProps) => {
  const today = new Date().toISOString().slice(0, 10)
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [points, setPoints] = useState<Points>([from ?? null, to ?? null])
  /** Which point the next click replaces; clicks alternate between the two. */
  const [slot, setSlot] = useState<0 | 1>(0)
  const [view, setView] = useState(() => {
    const anchor = new Date(`${to ?? today}T00:00:00Z`)
    return { year: anchor.getUTCFullYear(), month: anchor.getUTCMonth() }
  })

  /** Close without applying: drop unapplied picks so the trigger matches the data. */
  const dismiss = useCallback(() => {
    setOpen(false)
    setPoints([from ?? null, to ?? null])
    setSlot(0)
  }, [from, to])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss()
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, dismiss])

  const { start, end } = sortedRange(points)

  const shiftMonths = (delta: number) =>
    setView(({ year, month }) => {
      const next = new Date(Date.UTC(year, month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })

  const pick = (key: string) => {
    setPoints((prev) => (slot === 0 ? [key, prev[1]] : [prev[0], key]))
    setSlot((s) => (s === 0 ? 1 : 0))
  }

  const clear = () => {
    setPoints([null, null])
    setSlot(0)
  }

  const apply = () => {
    if (!start || !end) return
    onApply(start, end)
    setOpen(false)
  }

  const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      dayKey(view.year, view.month, i + 1),
    ),
  ]
  const monthLabel = new Date(Date.UTC(view.year, view.month, 1)).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric", timeZone: "UTC" },
  )

  const summary = start
    ? `${formatDay(start)} – ${end ? formatDay(end) : "…"} (UTC)`
    : "Select dates"

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? dismiss() : setOpen(true))}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[13px] text-accent tabular-nums transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-600"
      >
        <HiOutlineCalendar className="size-4 text-neutral-400" aria-hidden />
        {summary}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Custom date range"
          className="absolute top-full left-0 z-30 mt-2 w-72 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-lg md:right-0 md:left-auto dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="flex">
              <button type="button" aria-label="Previous year" className={NAV_BUTTON_CLASS} onClick={() => shiftMonths(-12)}>
                <HiChevronDoubleLeft className="size-4" aria-hidden />
              </button>
              <button type="button" aria-label="Previous month" className={NAV_BUTTON_CLASS} onClick={() => shiftMonths(-1)}>
                <HiChevronLeft className="size-4" aria-hidden />
              </button>
            </div>
            <p className="text-sm font-medium text-accent">{monthLabel}</p>
            <div className="flex">
              <button type="button" aria-label="Next month" className={NAV_BUTTON_CLASS} onClick={() => shiftMonths(1)}>
                <HiChevronRight className="size-4" aria-hidden />
              </button>
              <button type="button" aria-label="Next year" className={NAV_BUTTON_CLASS} onClick={() => shiftMonths(12)}>
                <HiChevronDoubleRight className="size-4" aria-hidden />
              </button>
            </div>
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
              const isEndpoint = key === start || key === end
              const inRange = start && end && key > start && key < end
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isEndpoint}
                  aria-label={formatDay(key)}
                  onClick={() => pick(key)}
                  className={[
                    "h-8 text-[13px] tabular-nums transition-colors",
                    isEndpoint
                      ? "rounded-md bg-accent font-medium text-white dark:text-neutral-950"
                      : inRange
                        ? "bg-neutral-100 text-accent dark:bg-neutral-800 dark:text-neutral-100"
                        : "rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    key === today && !isEndpoint ? "font-semibold underline underline-offset-4" : "",
                  ].join(" ")}
                >
                  {Number(key.slice(8))}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={clear}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={!start || !end}
              onClick={apply}
              className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition-opacity disabled:opacity-50 dark:text-neutral-950"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DateRangeCalendar
