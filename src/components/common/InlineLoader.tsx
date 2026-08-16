import Spinner from "./Spinner"

type InlineLoaderProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const InlineLoader = ({
  label = "Loading…",
  size = "sm",
  className = "",
}: InlineLoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={[
      "flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400",
      className,
    ].join(" ")}
  >
    <Spinner size={size} />
    <span>{label}</span>
  </div>
)

export default InlineLoader
