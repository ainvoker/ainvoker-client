import { useEffect, useId, useRef, useState } from "react"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { HiChevronDown, HiOutlineFolderPlus, HiOutlineSquares2X2 } from "react-icons/hi2"
import {
  getProjectById,
  formatProjectEnvironment,
  formatProjectStatus,
  isProjectInactive,
  projectStatusBadgeClass,
} from "../../utils/projects"
import { routes } from "../../utils/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import ProjectService from "../../services/ProjectService"
import CreateProjectModal from "./CreateProjectModal"
import type { CreateProjectInput } from "../../services/ProjectService"

type ProjectSwitcherProps = {
  onNavigate?: () => void
}

const ProjectSwitcher = ({ onNavigate }: ProjectSwitcherProps) => {
  const { projectId = "" } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    projects,
    createProject,
    ensureProjectOrganization,
    isProjectsLoading,
    canMutateResources,
  } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [resolvedName, setResolvedName] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const current = getProjectById(projects, projectId)
  const label = current?.name ?? resolvedName ?? (isProjectsLoading ? "Loading…" : projectId)
  const environment = current ? formatProjectEnvironment(current.environment) : null

  const subPath = location.pathname.replace(/^\/projects\/[^/]+/, "") || ""

  useEffect(() => {
    if (current) {
      setResolvedName(current.name)
      return
    }

    if (!token || !projectId) return

    let cancelled = false
    void (async () => {
      const [project] = await ProjectService.get(token, projectId)
      if (cancelled || !project) return
      setResolvedName(project.name)
      ensureProjectOrganization(project)
    })()

    return () => {
      cancelled = true
    }
  }, [current, token, projectId, ensureProjectOrganization])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const closeAndNavigate = () => {
    setOpen(false)
    onNavigate?.()
  }

  const switchTo = (id: string) => {
    closeAndNavigate()
    navigate(`/projects/${id}${subPath}`)
  }

  const handleCreate = async (
    input: CreateProjectInput,
  ): Promise<[unknown, string | undefined]> => {
    const [project, err] = await createProject(input)
    if (err || !project) return [null, err ?? "Failed to create project"]
    onNavigate?.()
    navigate(routes.project(project.id))
    return [project, undefined]
  }

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
              Project
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-accent">{label}</p>
            {environment ? (
              <p className="mt-0.5 truncate text-[11px] tracking-wide text-neutral-400">
                {environment}
                {current && isProjectInactive(current.status)
                  ? ` · ${formatProjectStatus(current.status)}`
                  : ""}
              </p>
            ) : null}
          </div>
          <HiChevronDown
            className={[
              "size-3.5 shrink-0 text-neutral-400 transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label="Switch project"
            className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-neutral-100 p-1.5 dark:border-neutral-800">
              <Link
                to={routes.projects}
                onClick={closeAndNavigate}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <HiOutlineSquares2X2 className="size-3.5 opacity-70" aria-hidden />
                See all projects
              </Link>
              <button
                type="button"
                disabled={!canMutateResources}
                onClick={() => {
                  if (!canMutateResources) return
                  setOpen(false)
                  setCreateOpen(true)
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:disabled:hover:bg-transparent dark:disabled:hover:text-neutral-300"
              >
                <HiOutlineFolderPlus className="size-3.5 opacity-70" aria-hidden />
                {canMutateResources ? "Create a project" : "Billing required"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto pb-1">
              <p className="px-3 py-2 text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
                All projects
              </p>
              {isProjectsLoading && projects.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                  Loading…
                </p>
              ) : null}
              {!isProjectsLoading && projects.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                  No projects yet
                </p>
              ) : null}
              {projects.map((project) => {
                const active = project.id === projectId
                return (
                  <button
                    key={project.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => switchTo(project.id)}
                    className={[
                      "flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2 text-left transition-colors",
                      active
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/70",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-accent">
                      <span className="truncate">{project.name}</span>
                      {isProjectInactive(project.status) ? (
                        <span
                          className={[
                            "shrink-0 rounded px-1 py-px text-[10px] font-medium uppercase tracking-wide",
                            projectStatusBadgeClass(project.status),
                          ].join(" ")}
                        >
                          {formatProjectStatus(project.status)}
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate text-[12px] text-neutral-400">
                      {formatProjectEnvironment(project.environment)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  )
}

export default ProjectSwitcher
