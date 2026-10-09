type SegmentedControlProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (next: T) => void
}

const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => {
  return (
    <div
      className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
      role="group"
      aria-label={label}
    >
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
              selected
                ? "bg-accent text-white dark:text-neutral-950"
                : "text-neutral-500 hover:text-accent dark:text-neutral-400 dark:hover:text-neutral-100",
            ].join(" ")}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
