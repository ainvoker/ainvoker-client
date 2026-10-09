import { useId, useMemo, useState } from "react"
import type {
  UsageDailyPoint,
  UsageDailySegmentPoint,
} from "../../services/UsageService"
import {
  daysInUtcMonth,
  evenPaceAtDay,
  formatQuotaValue,
  type BindingQuota,
} from "../../utils/quota"

export type QuotaPaceSeries = "cumulative" | "daily"

type QuotaPaceChartProps = {
  daily: UsageDailyPoint[]
  binding: BindingQuota
  /** Draw the even-pace dashed reference (default true when a limit exists). */
  showPaceLine?: boolean
  className?: string
  /** Shorter chart for dense pages. */
  compact?: boolean
  /**
   * Zoom to the last N elapsed days of this month.
   * Omit for the full month (includes future shaded zone).
   */
  windowDays?: number
  /** Cumulative burn (default) or per-day usage. */
  series?: QuotaPaceSeries
  /**
   * Optional per-day segment rows for a stacked area breakdown
   * (e.g. by project or model). When set, renders stacked bands.
   */
  breakdown?: UsageDailySegmentPoint[]
}

type ChartPoint = {
  dayIndex: number
  date: string
  dayUsed: number
  cumulative: number
  pace: number
  isFuture: boolean
}

type StackLayer = {
  id: string
  name: string
  color: string
  /** Per visible day index in `points`: day contribution. */
  dayValues: number[]
  /** Per visible day index: stacked top (cumulative across layers below + self). */
  stackTop: number[]
  stackBottom: number[]
}

const WIDTH = 640
const HEIGHT = 200
const PAD = { top: 14, right: 12, bottom: 28, left: 44 }
const MAX_STACK_LAYERS = 5

/** Distinct fills that stay readable on white/dark cards (avoid purple SaaS defaults). */
const STACK_COLORS = [
  "#0F766E",
  "#B45309",
  "#1D4ED8",
  "#A16207",
  "#475569",
  "#A8A29E",
]

function formatAxisDay(date: string): string {
  return new Date(date + "T00:00:00Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function segmentValue(
  row: UsageDailySegmentPoint,
  resource: BindingQuota["resource"],
): number {
  return resource === "requests" ? row.requestsUsed : row.tokensUsed
}

function buildStackLayers(
  breakdown: UsageDailySegmentPoint[],
  points: ChartPoint[],
  resource: BindingQuota["resource"],
  isDaily: boolean,
): StackLayer[] {
  const elapsed = points.filter((p) => !p.isFuture)
  if (elapsed.length === 0 || breakdown.length === 0) return []

  const dateSet = new Set(elapsed.map((p) => p.date))
  const totals = new Map<string, { name: string; total: number }>()
  const byDateId = new Map<string, number>()

  for (const row of breakdown) {
    if (!dateSet.has(row.date)) continue
    const value = segmentValue(row, resource)
    const prev = totals.get(row.id)
    totals.set(row.id, {
      name: row.name,
      total: (prev?.total ?? 0) + value,
    })
    byDateId.set(`${row.date}:${row.id}`, value)
  }

  const ranked = [...totals.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .filter(([, meta]) => meta.total > 0)

  if (ranked.length === 0) return []

  const top = ranked.slice(0, MAX_STACK_LAYERS)
  const rest = ranked.slice(MAX_STACK_LAYERS)
  const layerDefs: { id: string; name: string; color: string; ids: string[] }[] =
    top.map(([id, meta], i) => ({
      id,
      name: meta.name,
      color: STACK_COLORS[i % STACK_COLORS.length]!,
      ids: [id],
    }))

  if (rest.length > 0) {
    layerDefs.push({
      id: "__other__",
      name: "Other",
      color: STACK_COLORS[STACK_COLORS.length - 1]!,
      ids: rest.map(([id]) => id),
    })
  }

  const layers: StackLayer[] = layerDefs.map((def) => ({
    id: def.id,
    name: def.name,
    color: def.color,
    dayValues: elapsed.map((p) =>
      def.ids.reduce(
        (sum, id) => sum + (byDateId.get(`${p.date}:${id}`) ?? 0),
        0,
      ),
    ),
    stackTop: [],
    stackBottom: [],
  }))

  // Running totals for cumulative mode, then stack bottoms/tops
  const running = layers.map(() => 0)
  for (let di = 0; di < elapsed.length; di++) {
    let bottom = 0
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]!
      const dayVal = layer.dayValues[di] ?? 0
      const value = isDaily ? dayVal : (running[li]! += dayVal)
      layer.stackBottom[di] = bottom
      layer.stackTop[di] = bottom + value
      bottom += value
    }
  }

  return layers
}

function stackAreaPath(
  points: ChartPoint[],
  layer: StackLayer,
  xAt: (dayIndex: number) => number,
  yAt: (value: number) => number,
): string {
  const elapsed = points.filter((p) => !p.isFuture)
  if (elapsed.length === 0) return ""

  const forward = elapsed
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex)} ${yAt(layer.stackTop[i] ?? 0)}`,
    )
    .join(" ")
  const backward = [...elapsed]
    .reverse()
    .map(
      (p, revI) => {
        const i = elapsed.length - 1 - revI
        return `L ${xAt(p.dayIndex)} ${yAt(layer.stackBottom[i] ?? 0)}`
      },
    )
    .join(" ")
  return `${forward} ${backward} Z`
}

const QuotaPaceChart = ({
  daily,
  binding,
  showPaceLine = true,
  className,
  compact = false,
  windowDays,
  series = "cumulative",
  breakdown,
}: QuotaPaceChartProps) => {
  const gradientId = useId()
  const [hover, setHover] = useState<number | null>(null)
  const dim = daysInUtcMonth()
  const todayIndex = daily.length
  const isDaily = series === "daily"
  const isZoomed = windowDays != null && windowDays > 0
  const isStacked = (breakdown?.length ?? 0) > 0

  const points = useMemo(() => {
    const all: ChartPoint[] = []
    let cumulative = 0

    // Rolling ranges can span more days than the current month has.
    for (let i = 1; i <= Math.max(dim, daily.length); i++) {
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
      all.push({
        dayIndex: i,
        date,
        dayUsed,
        cumulative: i <= todayIndex ? cumulative : cumulative,
        pace: evenPaceAtDay(binding.limit, i, dim),
        isFuture: i > todayIndex,
      })
    }

    if (!isZoomed) return all

    const elapsed = Math.max(1, todayIndex)
    const startDay = Math.max(1, elapsed - windowDays! + 1)
    return all.filter((p) => p.dayIndex >= startDay && p.dayIndex <= elapsed)
  }, [
    daily,
    binding.resource,
    binding.limit,
    dim,
    todayIndex,
    isZoomed,
    windowDays,
  ])

  const stackLayers = useMemo(
    () =>
      isStacked && breakdown
        ? buildStackLayers(breakdown, points, binding.resource, isDaily)
        : [],
    [isStacked, breakdown, points, binding.resource, isDaily],
  )

  const visibleElapsed = points.filter((p) => !p.isFuture)
  const dailyAllowance =
    !binding.unlimited && dim > 0 ? binding.limit / dim : 0

  const yMax = useMemo(() => {
    if (isStacked && stackLayers.length > 0) {
      const lastLayer = stackLayers[stackLayers.length - 1]!
      const maxStack = Math.max(...lastLayer.stackTop, 0)
      const paceRef =
        showPaceLine && !binding.unlimited
          ? isDaily
            ? dailyAllowance
            : isZoomed
              ? Math.max(...visibleElapsed.map((p) => p.pace), 0)
              : binding.limit
          : 0
      return Math.max(maxStack, paceRef, 1)
    }

    if (isDaily) {
      const maxDay = Math.max(...visibleElapsed.map((p) => p.dayUsed), 0)
      const paceRef =
        showPaceLine && !binding.unlimited ? dailyAllowance : 0
      return Math.max(maxDay, paceRef, 1)
    }

    const maxCum = Math.max(
      ...visibleElapsed.map((p) => p.cumulative),
      0,
    )
    if (isZoomed) {
      const maxPace = Math.max(
        ...visibleElapsed.map((p) => p.pace),
        0,
      )
      const paceRef =
        showPaceLine && !binding.unlimited ? maxPace : 0
      return Math.max(maxCum, paceRef, 1)
    }

    return Math.max(
      showPaceLine && !binding.unlimited ? binding.limit : 0,
      maxCum,
      1,
    )
  }, [
    isStacked,
    stackLayers,
    isDaily,
    visibleElapsed,
    showPaceLine,
    binding.unlimited,
    binding.limit,
    dailyAllowance,
    isZoomed,
  ])

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom

  const xStart = points[0]?.dayIndex ?? 1
  const xEnd = points[points.length - 1]?.dayIndex ?? dim
  const xSpan = Math.max(xEnd - xStart, 1)

  const xAt = (dayIndex: number) =>
    PAD.left + ((dayIndex - xStart) / xSpan) * plotW
  const yAt = (value: number) => PAD.top + plotH - (value / yMax) * plotH

  const valueAt = (p: ChartPoint) => (isDaily ? p.dayUsed : p.cumulative)

  const actualPath = visibleElapsed
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex)} ${yAt(valueAt(p))}`,
    )
    .join(" ")

  const areaPath =
    !isStacked && visibleElapsed.length > 0
      ? [
          `M ${xAt(visibleElapsed[0].dayIndex)} ${yAt(0)}`,
          ...visibleElapsed.map(
            (p) => `L ${xAt(p.dayIndex)} ${yAt(valueAt(p))}`,
          ),
          `L ${xAt(visibleElapsed[visibleElapsed.length - 1].dayIndex)} ${yAt(0)}`,
          "Z",
        ].join(" ")
      : ""

  const pacePath = (() => {
    if (!showPaceLine || binding.unlimited || points.length === 0) return ""
    if (isDaily) {
      const y = yAt(dailyAllowance)
      return `M ${xAt(xStart)} ${y} L ${xAt(xEnd)} ${y}`
    }
    return points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex)} ${yAt(p.pace)}`,
      )
      .join(" ")
  })()

  const showFutureZone =
    !isZoomed && todayIndex > 0 && todayIndex < dim && points.length > 0

  const active =
    hover != null && hover >= 0 && hover < points.length
      ? points[hover]
      : null
  const activeElapsedIndex =
    active && !active.isFuture
      ? visibleElapsed.findIndex((p) => p.dayIndex === active.dayIndex)
      : -1

  const actualEnd =
    todayIndex > 0
      ? points.find((p) => p.dayIndex === todayIndex) ??
        points[points.length - 1]
      : null

  const overPace =
    !binding.unlimited &&
    !isDaily &&
    actualEnd != null &&
    actualEnd.cumulative > evenPaceAtDay(binding.limit, todayIndex, dim)

  const ariaLabel = isStacked
    ? `Stacked ${isDaily ? "daily" : "cumulative"} ${binding.resource} by segment`
    : isDaily
      ? `Daily ${binding.resource} usage${isZoomed ? ` (last ${windowDays} days)` : " this month"}`
      : binding.unlimited
        ? `Cumulative ${binding.resource} this month: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)}`
        : overPace
          ? `Over pace: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)} used of ${formatQuotaValue(binding.resource, binding.limit)}`
          : `On pace: ${formatQuotaValue(binding.resource, actualEnd?.cumulative ?? 0)} used of ${formatQuotaValue(binding.resource, binding.limit)}`

  const leftLabel = isZoomed
    ? formatAxisDay(points[0]?.date ?? "")
    : "1"
  const midLabel = isZoomed ? null : "Month"
  const rightLabel = isZoomed
    ? formatAxisDay(points[points.length - 1]?.date ?? "")
    : String(dim)

  const paceLegend = isDaily ? "Daily allowance" : "Even pace"

  const slotWidth = plotW / Math.max(points.length, 1)

  const yTicks = [
    { value: 0, dy: 3 },
    { value: yMax / 2, dy: 3 },
    { value: yMax, dy: 4 },
  ]

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

        {yTicks
          .filter((t) => t.value > 0)
          .map((t) => (
            <line
              key={`grid-${t.value}`}
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(t.value)}
              y2={yAt(t.value)}
              stroke="currentColor"
              strokeWidth={1}
              className="text-neutral-200 dark:text-neutral-700"
              opacity={0.7}
            />
          ))}

        {showFutureZone ? (
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

        {isStacked
          ? stackLayers.map((layer) => (
              <path
                key={layer.id}
                d={stackAreaPath(points, layer, xAt, yAt)}
                fill={layer.color}
                fillOpacity={0.72}
                stroke={layer.color}
                strokeWidth={0.5}
                strokeOpacity={0.9}
              />
            ))
          : null}

        {!isStacked && areaPath ? (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        ) : null}

        {!isStacked && actualPath ? (
          <path
            d={actualPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}

        {!isZoomed && todayIndex > 0 && todayIndex <= dim ? (
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
              x={xAt(p.dayIndex) - slotWidth / 2}
              y={PAD.top}
              width={Math.max(slotWidth, 8)}
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
            {!isStacked ? (
              <circle
                cx={xAt(active.dayIndex)}
                cy={yAt(valueAt(active))}
                r={3.5}
                className="fill-accent"
              />
            ) : null}
          </g>
        ) : null}

        {yTicks.map((t) => (
          <text
            key={`y-${t.value}`}
            x={PAD.left - 6}
            y={yAt(t.value) + t.dy}
            textAnchor="end"
            className="fill-neutral-400 text-[10px]"
          >
            {formatQuotaValue(binding.resource, Math.round(t.value))}
          </text>
        ))}

        <text
          x={PAD.left}
          y={HEIGHT - 8}
          className="fill-neutral-400 text-[10px]"
        >
          {leftLabel}
        </text>
        {midLabel ? (
          <text
            x={PAD.left + plotW / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-neutral-400 text-[10px]"
          >
            {midLabel}
          </text>
        ) : null}
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - 8}
          textAnchor="end"
          className="fill-neutral-400 text-[10px]"
        >
          {rightLabel}
        </text>
      </svg>

      {active && !active.isFuture ? (
        <div
          className="pointer-events-none absolute top-2 left-1/2 z-10 max-w-xs -translate-x-1/2 rounded-lg border border-neutral-200/80 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
          role="tooltip"
        >
          <p className="font-medium text-accent">{active.date}</p>
          {isStacked && activeElapsedIndex >= 0 ? (
            <ul className="mt-1 space-y-0.5 text-neutral-500 dark:text-neutral-400">
              {[...stackLayers].reverse().map((layer) => {
                const dayVal = layer.dayValues[activeElapsedIndex] ?? 0
                const shown = isDaily
                  ? dayVal
                  : (layer.stackTop[activeElapsedIndex] ?? 0) -
                    (layer.stackBottom[activeElapsedIndex] ?? 0)
                if (shown <= 0) return null
                return (
                  <li
                    key={layer.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <span
                        className="inline-block size-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: layer.color }}
                        aria-hidden
                      />
                      <span className="truncate">{layer.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatQuotaValue(binding.resource, shown)}
                    </span>
                  </li>
                )
              })}
              <li className="flex justify-between gap-3 border-t border-neutral-100 pt-0.5 font-medium text-accent dark:border-neutral-800">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatQuotaValue(
                    binding.resource,
                    isDaily ? active.dayUsed : active.cumulative,
                  )}
                </span>
              </li>
            </ul>
          ) : (
            <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
              {isDaily ? (
                <>
                  That day{" "}
                  {formatQuotaValue(binding.resource, active.dayUsed)}
                  {!binding.unlimited
                    ? ` · Allowance ${formatQuotaValue(binding.resource, Math.round(dailyAllowance))}`
                    : ""}
                </>
              ) : (
                <>
                  That day{" "}
                  {formatQuotaValue(binding.resource, active.dayUsed)} ·
                  Cumulative{" "}
                  {formatQuotaValue(binding.resource, active.cumulative)}
                  {!binding.unlimited
                    ? ` · Pace ${formatQuotaValue(binding.resource, Math.round(active.pace))}`
                    : ""}
                </>
              )}
            </p>
          )}
        </div>
      ) : null}

      {isStacked && stackLayers.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-400">
          {stackLayers.map((layer) => (
            <span
              key={layer.id}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="inline-block size-2 rounded-sm"
                style={{ backgroundColor: layer.color }}
                aria-hidden
              />
              <span className="max-w-[10rem] truncate">{layer.name}</span>
            </span>
          ))}
          {!binding.unlimited && showPaceLine ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-3 border-t border-dashed border-neutral-400"
                aria-hidden
              />
              {paceLegend}
            </span>
          ) : null}
        </div>
      ) : !binding.unlimited && showPaceLine ? (
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 bg-accent" aria-hidden />
            {isDaily ? "Daily" : "Actual"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3 border-t border-dashed border-neutral-400"
              aria-hidden
            />
            {paceLegend}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export default QuotaPaceChart
