import type { ReactNode } from "react"
import { HiCheck, HiMinus } from "react-icons/hi2"

type CheckboxProps = {
  checked: boolean
  /** Some but not all children are checked. Shown as a dash; clicking checks everything. */
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  className?: string
}

const Checkbox = ({
  checked,
  indeterminate = false,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
}: CheckboxProps) => {
  const filled = checked || indeterminate

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange(indeterminate ? true : !checked)}
      className={[
        "group flex w-full items-start gap-3 rounded-lg text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "mt-0.5 grid size-[18px] shrink-0 place-content-center rounded-[5px] border transition-colors",
          filled
            ? "border-accent bg-accent text-white dark:text-neutral-950"
            : "border-neutral-300 bg-white group-hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-950 dark:group-hover:border-neutral-500",
        ].join(" ")}
      >
        {indeterminate ? (
          <HiMinus className="size-3" strokeWidth={1.5} />
        ) : checked ? (
          <HiCheck className="size-3" strokeWidth={1.5} />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  )
}

export default Checkbox
