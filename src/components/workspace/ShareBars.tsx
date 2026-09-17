import { Link } from "react-router-dom"
import { HiOutlineArrowUpRight } from "react-icons/hi2"

export type ShareBarItem = {
  id: string
  name: string
  value: number
  href?: string
}

type ShareBarsProps = {
  title: string
  items: ShareBarItem[]
  formatValue?: (value: number) => string
  emptyDescription?: string
}

const ShareBars = ({
  title,
  items,
  formatValue = (v) => v.toLocaleString(),
  emptyDescription = "No mix to show until traffic lands.",
}: ShareBarsProps) => {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const sorted = [...items].sort((a, b) => b.value - a.value)

  return (
    <section className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-[15px] font-medium text-accent">{title}</h2>

      {sorted.length === 0 || total <= 0 ? (
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {emptyDescription}
        </p>
      ) : (
        <ul className="mt-2.5 flex flex-1 flex-col gap-2">
          {sorted.map((item) => {
            const pct = Math.round((item.value / total) * 100)
            const row = (
              <>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-accent">
                    {item.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-neutral-500 dark:text-neutral-400">
                    {pct}% · {formatValue(item.value)}
                    {item.href ? (
                      <HiOutlineArrowUpRight
                        className="size-3.5 text-neutral-300 transition group-hover:text-accent dark:text-neutral-600"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            )
            return (
              <li key={item.id} className="space-y-1.5">
                {item.href ? (
                  <Link
                    to={item.href}
                    className="group block space-y-1.5 rounded-md outline-offset-2"
                  >
                    {row}
                  </Link>
                ) : (
                  row
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default ShareBars
