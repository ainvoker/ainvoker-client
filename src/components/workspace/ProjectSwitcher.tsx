import { useEffect, useId, useRef, useState } from "react"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { HiChevronDown, HiOutlineFolderPlus, HiOutlineSquares2X2 } from "react-icons/hi2"
import { getProjectById, formatProjectEnvironment } from "../../utils/projects"
import { routes } from "../../utils/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import ProjectService from "../../services/ProjectService"
import CreateProjectModal from "./CreateProjectModal"
import type { CreateProjectInput } from "../../services/ProjectService"

const ProjectSwitcher = () => {
  const { projectId = "" } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    projects,
    createProject,
    ensureProjectOrganization,
    isProjectsLoading,
  } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [resolvedName, setResolvedName] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const current = getProjectById(projects, projectId)
  const label = current?.name ?? resolvedName ?? (isProjectsLoading ? "Loading…" : projectId)

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

  const switchTo = (id: string) => {
    setOpen(false)
    navigate(`/projects/${id}${subPath}`)
  }

  const handleCreate = async (
    input: CreateProjectInput,
  ): Promise<[unknown, string | undefined]> => {
    const [project, err] = await createProject(input)
    if (err || !project) return [null, err ?? "Failed to create project"]
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
          className="inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <span className="truncate text-sm font-semibold text-accent">{label}</span>
          <HiChevronDown
            className={[
              "size-4 shrink-0 text-neutral-400 transition-transform",
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
            className="absolute top-full left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="truncate text-sm font-medium text-accent">{label}</p>
              <div className="mt-2 flex flex-col gap-0.5">
                <Link
                  to={routes.projects}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <HiOutlineSquares2X2 className="size-4 opacity-70" aria-hidden />
                  See all projects
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setCreateOpen(true)
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <HiOutlineFolderPlus className="size-4 opacity-70" aria-hidden />
                  Create a project
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto py-2">
              <p className="px-4 py-1.5 text-[11px] font-medium tracking-widest text-neutral-400 uppercase">
                All projects
              </p>
              {isProjectsLoading && projects.length === 0 ? (
                <p className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">Loading…</p>
              ) : null}
              {!isProjectsLoading && projects.length === 0 ? (
                <p className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">No projects yet</p>
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
                      "flex w-full cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-left transition-colors",
                      active
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/70",
                    ].join(" ")}
                  >
                    <span className="truncate text-sm font-medium text-accent">
                      {project.name}
                    </span>
                    <span className="truncate text-xs text-neutral-400">
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
