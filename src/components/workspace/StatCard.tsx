type StatCardProps = {
  label: string
  value: string
  hint?: string
}

const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
    <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-accent">{value}</p>
    {hint ? (
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
    ) : null}
  </div>
)

export default StatCard
