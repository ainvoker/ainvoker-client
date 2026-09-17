type SparkMetricChipProps = {
  label: string
  value: string
  hint?: string
  /** Values for the mini sparkline (oldest → newest). */
  series?: number[]
}

const Sparkline = ({ series }: { series: number[] }) => {
  const w = 72
  const h = 28
  const max = Math.max(...series, 1)
  const min = Math.min(...series, 0)
  const range = Math.max(max - min, 1)
  const pts = series.map((v, i) => {
    const x = series.length <= 1 ? 0 : (i / (series.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  const line = pts.join(" ")
  const area =
    series.length > 0
      ? `M 0,${h} L ${line.replace(/ /g, " L ")} L ${w},${h} Z`
      : ""

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-7 w-[4.5rem] shrink-0 text-accent"
      aria-hidden
    >
      {area ? (
        <path d={area} fill="currentColor" opacity={0.08} />
      ) : null}
      {series.length > 1 ? (
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : (
        <line
          x1={0}
          y1={h / 2}
          x2={w}
          y2={h / 2}
          stroke="currentColor"
          strokeWidth={1.5}
          opacity={0.35}
        />
      )}
    </svg>
  )
}

const SparkMetricChip = ({
  label,
  value,
  hint,
  series,
}: SparkMetricChipProps) => (
  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      {series && series.length > 0 ? <Sparkline series={series} /> : null}
    </div>
    <div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-accent">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  </div>
)

export default SparkMetricChip
