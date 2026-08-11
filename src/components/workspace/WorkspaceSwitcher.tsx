import { useEffect, useId, useRef, useState } from "react"
import { HiChevronDown, HiOutlinePlus } from "react-icons/hi2"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import CreateWorkspaceModal from "./CreateWorkspaceModal"
import type { CreateOrganizationInput } from "../../services/OrganizationService"

const WorkspaceSwitcher = () => {
  const {
    organizations,
    activeOrganization,
    setActiveWorkspace,
    createWorkspace,
    isLoading,
  } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const label = activeOrganization?.name ?? (isLoading ? "Loading…" : "Workspace")

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

  const handleCreate = async (input: CreateOrganizationInput) => {
    return createWorkspace(input)
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
            <p className="truncate text-[13px] font-semibold text-accent">{label}</p>
            {activeOrganization?.role ? (
              <p className="mt-0.5 truncate text-[11px] tracking-wide text-neutral-400 capitalize">
                {activeOrganization.role}
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
            aria-label="Switch workspace"
            className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
          >
            <p className="px-3 py-2 text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
              Workspaces
            </p>
            <div className="max-h-64 overflow-y-auto pb-1">
              {organizations.length === 0 && !isLoading ? (
                <p className="px-3 py-2 text-[13px] text-neutral-500">No workspaces yet</p>
              ) : null}
              {organizations.map((org) => {
                const active = org.id === activeOrganization?.id
                return (
                  <button
                    key={org.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setActiveWorkspace(org.id)
                      setOpen(false)
                    }}
                    className={[
                      "flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2 text-left transition-colors",
                      active ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/70",
                    ].join(" ")}
                  >
                    <span className="truncate text-[13px] font-medium text-accent">
                      {org.name}
                    </span>
                    <span className="truncate text-[12px] text-neutral-400 capitalize">
                      {org.role}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-neutral-100 p-1.5 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setCreateOpen(true)
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <HiOutlinePlus className="size-3.5" aria-hidden />
                Create workspace
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  )
}

export default WorkspaceSwitcher
