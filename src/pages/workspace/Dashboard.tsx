import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { HiOutlineArrowRight, HiOutlineFolder } from "react-icons/hi2"
import Skeleton, { SkeletonCard } from "../../components/common/Skeleton"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import StatCard from "../../components/workspace/StatCard"
import QuotaBars from "../../components/workspace/QuotaBars"
import RecentRequestsTable from "../../components/workspace/RecentRequestsTable"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import UsageService, { type OrganizationUsage } from "../../services/UsageService"
import {
  formatCompactNumber,
  formatTokens,
  successRatePercent,
} from "../../utils/requests"
import {
  formatProjectEnvironment,
  formatProjectStatus,
  isProjectInactive,
  projectStatusBadgeClass,
} from "../../utils/projects"
import { routes } from "../../utils/navigation"

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-5" aria-busy="true" role="status">
    <span className="sr-only">Loading dashboard…</span>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-16" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
    <SkeletonCard />
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { token } = useAuth()
  const {
    activeOrganization,
    activeOrganizationId,
    canMutateResources,
    isLoading: workspaceLoading,
  } = useWorkspace()

  const [usage, setUsage] = useState<OrganizationUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsage = useCallback(async () => {
    if (!token || !activeOrganizationId) {
      setUsage(null)
      setIsLoading(false)
      setError(!activeOrganizationId ? null : "Not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    const [data, err] = await UsageService.getOrganizationUsage(
      token,
      activeOrganizationId,
    )
    if (err || !data) {
      setUsage(null)
      setError(err ?? "Failed to load dashboard")
      setIsLoading(false)
      return
    }

    setUsage(data)
    setIsLoading(false)
  }, [token, activeOrganizationId])

  useEffect(() => {
    void loadUsage()
  }, [loadUsage])

  const workspaceName = activeOrganization?.name ?? "this workspace"
  const busy = workspaceLoading || isLoading
  const period = usage?.period
  const rate = period
    ? successRatePercent(period.successfulRequests, period.failedRequests)
    : null

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Dashboard"
        description={`Monitor inference traffic, model health, and plan usage across ${workspaceName}.`}
      >
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {busy && !usage ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Requests (month)"
                value={formatCompactNumber(period?.requestsUsed ?? 0)}
                hint="Counted toward plan limits"
              />
              <StatCard
                label="Tokens (month)"
                value={formatTokens(period?.tokensUsed ?? 0)}
                hint="Input + output"
              />
              <StatCard
                label="Success rate"
                value={rate == null ? "—" : `${rate}%`}
                hint={
                  period
                    ? `${period.successfulRequests} ok · ${period.failedRequests} failed`
                    : undefined
                }
              />
              <StatCard
                label="Projects"
                value={formatCompactNumber(usage?.projects.length ?? 0)}
                hint={
                  canMutateResources
                    ? "Active workspace"
                    : "Billing required to create more"
                }
              />
            </div>

            <QuotaBars
              plan={usage?.plan ?? null}
              requestsUsed={period?.requestsUsed ?? 0}
              tokensUsed={period?.tokensUsed ?? 0}
            />

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-accent">Projects</h2>
                <Link
                  to={routes.projects}
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  View all
                </Link>
              </div>

              {!usage || usage.projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
                  <HiOutlineFolder
                    className="size-8 text-neutral-300 dark:text-neutral-600"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-medium text-accent">
                      No projects yet
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Create a project to start issuing API keys and logging
                      traffic.
                    </p>
                  </div>
                  <Link
                    to={routes.projects}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    Go to projects
                    <HiOutlineArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {usage.projects.map((project) => (
                    <Link
                      key={project.id}
                      to={routes.projectOverview(project.id)}
                      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-5 transition hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-accent">
                              {project.name}
                            </p>
                            {isProjectInactive(project.status) ? (
                              <span
                                className={[
                                  "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                  projectStatusBadgeClass(project.status),
                                ].join(" ")}
                              >
                                {formatProjectStatus(project.status)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs tracking-wide text-neutral-400 uppercase">
                            {formatProjectEnvironment(project.environment)}
                          </p>
                        </div>
                        <HiOutlineArrowRight
                          className="size-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-accent dark:text-neutral-600"
                          aria-hidden
                        />
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-neutral-400">Requests</dt>
                          <dd className="font-medium tabular-nums text-accent">
                            {formatCompactNumber(project.requestsUsed)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-neutral-400">Tokens</dt>
                          <dd className="font-medium tabular-nums text-accent">
                            {formatTokens(project.tokensUsed)}
                          </dd>
                        </div>
                      </dl>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-accent">
                Recent traffic
              </h2>
              <RecentRequestsTable
                items={usage?.recentRequests ?? []}
                showProject
                emptyDescription="Gateway calls across this workspace will appear here."
              />
            </section>
          </div>
        )}
      </WorkspacePage>
    </main>
  )
}

export default Dashboard
