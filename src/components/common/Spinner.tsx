type SpinnerSize = "sm" | "md" | "lg"

const sizeClass: Record<SpinnerSize, string> = {
  sm: "size-3.5 border-[1.5px]",
  md: "size-5 border-2",
  lg: "size-8 border-2",
}

type SpinnerProps = {
  size?: SpinnerSize
  className?: string
  /** When true, announces loading to assistive tech (use when Spinner is alone). */
  label?: string
}

const Spinner = ({ size = "md", className = "", label }: SpinnerProps) => {
  const ring = (
    <span
      className={[
        "inline-block shrink-0 rounded-full border-current border-r-transparent",
        "animate-spin text-accent",
        sizeClass[size],
        className,
      ].join(" ")}
      aria-hidden={label ? undefined : true}
      role={label ? "status" : undefined}
      aria-label={label}
    />
  )

  if (!label) return ring

  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      {ring}
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default Spinner
