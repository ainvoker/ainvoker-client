type SkeletonProps = {
  className?: string
}

/** Pulsing placeholder block for known layouts. */
const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    className={[
      "animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800",
      className,
    ].join(" ")}
    aria-hidden
  />
)

export const SkeletonLine = ({ className = "" }: SkeletonProps) => (
  <Skeleton className={["h-3 w-full", className].join(" ")} />
)

export const SkeletonCard = ({ className = "" }: SkeletonProps) => (
  <div
    className={[
      "rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900",
      className,
    ].join(" ")}
    aria-hidden
  >
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-4 h-8 w-32" />
    <Skeleton className="mt-3 h-3 w-full max-w-xs" />
    <Skeleton className="mt-2 h-3 w-2/3 max-w-[12rem]" />
  </div>
)

export default Skeleton
