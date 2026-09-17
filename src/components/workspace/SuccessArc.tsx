type SuccessArcProps = {
  percent: number | null
  label?: string
  detail?: string
  className?: string
  /** Tighter padding and smaller gauge for dense layouts. */
  compact?: boolean
}

const SuccessArc = ({
  percent,
  label = "Success rate",
  detail,
  className,
  compact = false,
}: SuccessArcProps) => {
  const r = compact ? 40 : 54
  const cx = compact ? 48 : 64
  const cy = compact ? 48 : 64
  const stroke = compact ? 6 : 8
  const viewW = compact ? 96 : 128
  const viewH = compact ? 60 : 80
  const circumference = Math.PI * r
  const value = percent == null ? 0 : Math.min(100, Math.max(0, percent))
  const dash = (value / 100) * circumference

  return (
    <section
      className={[
        "flex flex-col rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900",
        compact ? "p-3.5" : "items-center p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="text-[15px] font-medium text-accent">{label}</h2>
      <div
        className={[
          "relative",
          compact ? "mt-1 self-center" : "mt-2",
        ].join(" ")}
      >
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className={[
            "text-accent",
            compact ? "h-16 w-28" : "h-24 w-40",
          ].join(" ")}
          role="img"
          aria-label={
            percent == null ? "No success rate yet" : `${percent}% success`
          }
        >
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-neutral-100 dark:text-neutral-800"
          />
          {percent != null ? (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          ) : null}
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <p
            className={[
              "font-semibold tabular-nums text-accent",
              compact ? "text-xl" : "text-2xl",
            ].join(" ")}
          >
            {percent == null ? "—" : `${percent}%`}
          </p>
        </div>
      </div>
      {detail ? (
        <p className="mt-0.5 text-center text-xs text-neutral-400">{detail}</p>
      ) : null}
    </section>
  )
}

export default SuccessArc
