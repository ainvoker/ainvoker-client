import Spinner from "./Spinner"

type PageLoaderProps = {
  label?: string
  className?: string
  /** Use for full-viewport auth gates. */
  fullScreen?: boolean
}

const PageLoader = ({
  label = "Loading…",
  className = "",
  fullScreen = false,
}: PageLoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={[
      "flex flex-col items-center justify-center gap-3 text-sm text-neutral-500 dark:text-neutral-400",
      fullScreen
        ? "min-h-screen bg-[#f4f4f5] dark:bg-neutral-950"
        : "min-h-[12rem] w-full py-10",
      className,
    ].join(" ")}
  >
    <Spinner size="lg" />
    <p>{label}</p>
  </div>
)

export default PageLoader
