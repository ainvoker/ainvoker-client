import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import CreateProjectModal from "../../components/workspace/CreateProjectModal"
import Skeleton from "../../components/common/Skeleton"
import { routes } from "../../utils/navigation"
import {
  formatProjectEnvironment,
  formatProjectStatus,
  isProjectInactive,
  projectStatusBadgeClass,
} from "../../utils/projects"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import type { CreateProjectInput } from "../../services/ProjectService"
import { HiOutlineFolderPlus, HiOutlineArrowRight } from "react-icons/hi2"

const Projects = () => {
  const navigate = useNavigate()
  const {
    projects,
    activeOrganization,
    isLoading,
    isProjectsLoading,
    error,
    createProject,
    canMutateResources,
  } = useWorkspace()
  const [createOpen, setCreateOpen] = useState(false)

  const workspaceName = activeOrganization?.name ?? "this workspace"
  const busy = isLoading || isProjectsLoading
  const createDisabled = !canMutateResources

  const handleCreate = async (
    input: CreateProjectInput,
  ): Promise<[unknown, string | undefined]> => {
    const [project, err] = await createProject(input)
    if (err || !project) return [null, err ?? "Failed to create project"]
    navigate(routes.project(project.id))
    return [project, undefined]
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Projects"
        description={`Organize models, keys, and actions by environment in ${workspaceName}.`}
      >
        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        ) : null}

        {busy && projects.length === 0 ? (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-busy="true"
            role="status"
          >
            <span className="sr-only">Loading projects…</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={routes.project(project.id)}
                className="group flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 transition hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-accent">{project.name}</p>
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
                  <HiOutlineArrowRight className="size-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-accent dark:text-neutral-600" />
                </div>
                {project.description ? (
                  <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {project.description}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-neutral-400">{project.id}</p>
                )}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              disabled={createDisabled}
              className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white/50 p-5 text-center text-neutral-500 transition hover:border-neutral-400 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-300 disabled:hover:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100 dark:disabled:hover:border-neutral-600 dark:disabled:hover:text-neutral-400"
            >
              <HiOutlineFolderPlus className="size-6 opacity-50" aria-hidden />
              <p className="text-sm font-medium">Create project</p>
              <p className="text-xs">
                {createDisabled
                  ? "Activate billing to add projects"
                  : `Add a project to ${workspaceName}`}
              </p>
            </button>
          </div>
        )}

        {!busy && projects.length === 0 && !error ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            No projects yet in {workspaceName}. Create one to get started.
          </p>
        ) : null}
      </WorkspacePage>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </main>
  )
}

export default Projects
