import { Link, useLocation } from "react-router-dom"

type ErrorFallbackProps = {
  error: Error
  reset: () => void
  /** Fill the viewport when the shell around this tree is gone. */
  fullScreen?: boolean
}

const ErrorFallback = ({ error, reset, fullScreen = false }: ErrorFallbackProps) => {
  const location = useLocation()

  return (
    <div
      role="alert"
      className={[
        "flex w-full items-center justify-center px-4",
        fullScreen
          ? "min-h-screen bg-[#f4f4f5] dark:bg-neutral-950"
          : "min-h-[16rem] py-10",
      ].join(" ")}
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200/80 bg-white px-6 py-8 text-center text-accent shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h1 className="text-base font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          This page ran into a problem while rendering. You can try again, or go back home.
        </p>
        {import.meta.env.DEV ? (
          <p className="mt-3 max-h-24 overflow-auto text-left font-mono text-[11px] leading-relaxed text-neutral-400">
            {error.name}: {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95 dark:text-black"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            onClick={(event) => {
              if (
                location.pathname === "/" &&
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              ) {
                event.preventDefault()
                reset()
              }
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
