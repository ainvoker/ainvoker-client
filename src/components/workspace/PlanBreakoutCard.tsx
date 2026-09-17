import { Link } from "react-router-dom"
import { routes } from "../../utils/navigation"

type PlanBreakoutCardProps = {
  title: string
  body: string
  ctaLabel?: string
}

const PlanBreakoutCard = ({
  title,
  body,
  ctaLabel = "Manage billing",
}: PlanBreakoutCardProps) => (
  <section className="relative overflow-hidden rounded-2xl bg-accent px-5 py-6 text-white dark:text-neutral-950 md:px-6">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    />
    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <h2 className="text-[15px] font-medium">{title}</h2>
        <p className="mt-1 text-sm opacity-80">{body}</p>
      </div>
      <Link
        to={routes.billing}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:brightness-95 dark:bg-neutral-950 dark:text-white"
      >
        {ctaLabel}
      </Link>
    </div>
  </section>
)

export default PlanBreakoutCard
