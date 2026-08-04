type WorkspacePageProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

/** Shared empty-state shell for workspace outlets */
const WorkspacePage = ({ title, description, children }: WorkspacePageProps) => {
  return (
    <div className="flex flex-col gap-4 animate-[hero-in_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]">
      <header className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-accent md:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
      </header>

      {children ?? (
        <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-5 md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(17,17,17,0.12) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex min-h-32 flex-col items-start justify-center gap-1.5">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Coming soon
            </p>
            <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-300">
              This surface is ready for wiring. Content for{" "}
              <span className="font-medium text-accent">{title}</span> will land
              here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspacePage
