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

  const handleCreate = async (
    input: CreateOrganizationInput,
  ): Promise<[unknown, string | undefined]> => {
    const [org, err] = await createWorkspace(input)
    if (err || !org) return [null, err ?? "Failed to create workspace"]
    return [org, undefined]
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
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{label}</p>
            {activeOrganization?.role ? (
              <p className="mt-0.5 truncate text-[11px] tracking-wide text-neutral-500 capitalize">
                {activeOrganization.role}
              </p>
            ) : null}
          </div>
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
            aria-label="Switch workspace"
            className="absolute top-full left-0 z-50 mt-2 w-full min-w-[14rem] overflow-hidden rounded-xl border border-white/10 bg-accent shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          >
            <p className="px-4 py-2.5 text-[11px] font-medium tracking-widest text-neutral-500 uppercase">
              Workspaces
            </p>
            <div className="max-h-64 overflow-y-auto pb-1">
              {organizations.length === 0 && !isLoading ? (
                <p className="px-4 py-2 text-sm text-neutral-500">No workspaces yet</p>
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
                      "flex w-full cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-left transition-colors",
                      active ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span className="truncate text-sm font-medium text-white">
                      {org.name}
                    </span>
                    <span className="truncate text-xs text-neutral-500 capitalize">
                      {org.role}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-white/10 p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setCreateOpen(true)
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <HiOutlinePlus className="size-4" aria-hidden />
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
