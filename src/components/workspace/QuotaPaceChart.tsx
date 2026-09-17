import { useId, useMemo, useState } from "react"
import type { UsageDailyPoint } from "../../services/UsageService"
import {
  daysInUtcMonth,
  evenPaceAtDay,
  formatQuotaValue,
  type BindingQuota,
} from "../../utils/quota"

type QuotaPaceChartProps = {
  daily: UsageDailyPoint[]
  binding: BindingQuota
  /** Draw the even-pace dashed reference (default true when a limit exists). */
  showPaceLine?: boolean
  className?: string
  /** Shorter chart for dense pages. */
  compact?: boolean
}

type ChartPoint = {
  dayIndex: number
  date: string
  dayUsed: number
  cumulative: number
  pace: number
  isFuture: boolean
}

const WIDTH = 640
const HEIGHT = 200
const PAD = { top: 14, right: 12, bottom: 28, left: 8 }

const QuotaPaceChart = ({
  daily,
  binding,
  showPaceLine = true,
  className,
  compact = false,
}: QuotaPaceChartProps) => {
  const gradientId = useId()
  const [hover, setHover] = useState<number | null>(null)
  const dim = daysInUtcMonth()
  const todayIndex = daily.length

  const points = useMemo(() => {
    const series: ChartPoint[] = []
    let cumulative = 0

    for (let i = 1; i <= dim; i++) {
      const day = daily[i - 1]
      const date =
        day?.date ??
        new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            i,
          ),
        )
          .toISOString()
          .slice(0, 10)
      const dayUsed = day
        ? binding.resource === "requests"
          ? day.requestsUsed
          : day.tokensUsed
        : 0
      if (i <= todayIndex) {
        cumulative += dayUsed
      }
      series.push({
        dayIndex: i,
        date,
        dayUsed,
        cumulative: i <= todayIndex ? cumulative : cumulative,
        pace: evenPaceAtDay(binding.limit, i, dim),
        isFuture: i > todayIndex,
      })
    }

    // Future days keep last known cumulative flat for the actual line endpoint only
    return series
  }, [daily, binding.resource, binding.limit, dim, todayIndex])

  const actualEnd = points[Math.max(0, todayIndex - 1)]
  const yMax = Math.max(
    showPaceLine && !binding.unlimited ? binding.limit : 0,
    actualEnd?.cumulative ?? 0,
    1,
  )

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom

  const xAt = (dayIndex: number) =>
    PAD.left + ((dayIndex - 1) / Math.max(dim - 1, 1)) * plotW
  const yAt = (value: number) => PAD.top + plotH - (value / yMax) * plotH

  const actualPath = points
    .filter((p) => !p.isFuture)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex)} ${yAt(p.cumulative)}`)
    .join(" ")

  const areaPath =
    todayIndex > 0
      ? [
          `M ${xAt(1)} ${yAt(0)}`,
          ...points
            .filter((p) => !p.isFuture)
            .map((p) => `L ${xAt(p.dayIndex)} ${yAt(p.cumulative)}`),
          `L ${xAt(todayIndex)} ${yAt(0)}`,
          "Z",
        ].join(" ")
      : ""

  const pacePath =
    !showPaceLine || binding.unlimited
      ? ""
      : points
          .map(
            (p, i) =>
              `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex)} ${yAt(p.pace)}`,
          )
          .join(" ")

  const active = hover != null ? points[hover] : null
  const overPace =
    !binding.unlimited &&
    actualEnd != null &&
    actualEnd.cumulative > evenPaceAtDay(binding.limit, todayIndex, dim)

  const ariaLabel = binding.unlimited
    ? `Cumulative ${binding.resource} this month: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)}`
    : overPace
      ? `Over pace: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)} used of ${formatQuotaValue(binding.resource, binding.limit)}`
      : `On pace: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)} used of ${formatQuotaValue(binding.resource, binding.limit)}`

  return (
    <div className={["relative w-full", className].filter(Boolean).join(" ")}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={[
          "block h-auto w-full text-accent motion-safe:animate-[hero-in_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards] [@media(prefers-reduced-motion:reduce)]:animate-none",
          compact ? "max-h-44" : "max-h-60",
        ].join(" ")}
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Month-ahead projection zone */}
        {todayIndex > 0 && todayIndex < dim ? (
          <rect
            x={xAt(todayIndex)}
            y={PAD.top}
            width={xAt(dim) - xAt(todayIndex)}
            height={plotH}
            className="fill-neutral-100/80 dark:fill-neutral-800/50"
          />
        ) : null}

        {!binding.unlimited && pacePath ? (
          <path
            d={pacePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeDasharray="4 4"
            className="text-neutral-400 dark:text-neutral-500"
            opacity={0.85}
          />
        ) : null}

        {areaPath ? (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        ) : null}

        {actualPath ? (
          <path
            d={actualPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}

        {todayIndex > 0 && todayIndex <= dim ? (
          <line
            x1={xAt(todayIndex)}
            x2={xAt(todayIndex)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 3"
            className="text-neutral-300 dark:text-neutral-600"
          />
        ) : null}

        {points.map((p, i) => {
          if (p.isFuture) return null
          return (
            <rect
              key={p.date}
              x={xAt(p.dayIndex) - plotW / dim / 2}
              y={PAD.top}
              width={Math.max(plotW / dim, 8)}
              height={plotH}
              className="fill-transparent"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              role="listitem"
              aria-label={`${p.date}: ${formatQuotaValue(binding.resource, p.dayUsed)} that day, ${formatQuotaValue(binding.resource, p.cumulative)} cumulative`}
            />
          )
        })}

        {active && !active.isFuture ? (
          <g>
            <line
              x1={xAt(active.dayIndex)}
              x2={xAt(active.dayIndex)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="currentColor"
              strokeWidth={1}
              className="text-neutral-300 dark:text-neutral-600"
            />
            <circle
              cx={xAt(active.dayIndex)}
              cy={yAt(active.cumulative)}
              r={3.5}
              className="fill-accent"
            />
          </g>
        ) : null}

        <text
          x={PAD.left}
          y={HEIGHT - 8}
          className="fill-neutral-400 text-[10px]"
        >
          1
        </text>
        <text
          x={WIDTH / 2}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="fill-neutral-400 text-[10px]"
        >
          Month
        </text>
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - 8}
          textAnchor="end"
          className="fill-neutral-400 text-[10px]"
        >
          {dim}
        </text>
      </svg>

      {active && !active.isFuture ? (
        <div
          className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-neutral-200/80 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
          role="tooltip"
        >
          <p className="font-medium text-accent">{active.date}</p>
          <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
            That day {formatQuotaValue(binding.resource, active.dayUsed)} ·{" "}
            Cumulative {formatQuotaValue(binding.resource, active.cumulative)}
            {!binding.unlimited
              ? ` · Pace ${formatQuotaValue(binding.resource, Math.round(active.pace))}`
              : ""}
          </p>
        </div>
      ) : null}

      {!binding.unlimited && showPaceLine ? (
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 bg-accent" aria-hidden />
            Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3 border-t border-dashed border-neutral-400"
              aria-hidden
            />
            Even pace
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default QuotaPaceChart
