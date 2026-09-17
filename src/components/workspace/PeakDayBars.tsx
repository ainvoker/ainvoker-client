import { useMemo } from "react"
import type { UsageDailyPoint } from "../../services/UsageService"
import { formatCompactNumber } from "../../utils/requests"

type PeakDayBarsProps = {
  daily: UsageDailyPoint[]
  /** Which series to plot. */
  metric?: "requests" | "tokens"
  className?: string
  /** Shorter bars and tighter spacing for nested / dense layouts. */
  compact?: boolean
}

const PeakDayBars = ({
  daily,
  metric = "requests",
  className,
  compact = false,
}: PeakDayBarsProps) => {
  const bars = useMemo(() => {
    const slice = daily.slice(-7)
    return slice.map((d) => ({
      date: d.date,
      label: new Date(d.date + "T00:00:00Z").toLocaleDateString(undefined, {
        weekday: "short",
        timeZone: "UTC",
      }),
      value: metric === "tokens" ? d.tokensUsed : d.requestsUsed,
    }))
  }, [daily, metric])

  const max = Math.max(...bars.map((b) => b.value), 1)
  const peak = bars.reduce(
    (best, b) => (b.value > best.value ? b : best),
    bars[0] ?? { date: "", label: "—", value: 0 },
  )
  const barMaxPx = compact ? 56 : 96

  return (
    <section
      className={[
        "flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900",
        compact ? "p-3.5" : "p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-[15px] font-medium text-accent">Most active days</h2>
      <p className="mt-0.5 text-xs text-neutral-400">
        {peak.value > 0
          ? `Busiest · ${peak.date} · ${formatCompactNumber(peak.value)}`
          : "No traffic in the last week"}
      </p>

      {bars.length === 0 ? (
        <p className="mt-auto pt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Daily activity will show here.
        </p>
      ) : (
        <div
          className="mt-auto flex items-end gap-1.5 pt-3"
          style={{ minHeight: barMaxPx + 20 }}
          role="img"
          aria-label="Request volume by day"
        >
          {bars.map((b) => {
            const h = Math.max(4, Math.round((b.value / max) * barMaxPx))
            const isPeak = b.date === peak.date && peak.value > 0
            return (
              <div
                key={b.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div
                  className="flex w-full flex-col justify-end"
                  style={{ height: barMaxPx }}
                >
                  <div
                    className={[
                      "w-full max-w-6 self-center rounded-t-md",
                      isPeak
                        ? "bg-accent"
                        : "bg-neutral-200 dark:bg-neutral-700",
                    ].join(" ")}
                    style={{ height: `${h}px` }}
                    title={`${b.date}: ${formatCompactNumber(b.value)}`}
                  />
                </div>
                <span className="text-[10px] leading-none text-neutral-400">
                  {b.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default PeakDayBars
