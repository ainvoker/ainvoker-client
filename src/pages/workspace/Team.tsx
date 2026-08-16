import { Navigate } from "react-router-dom"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import { routes } from "../../utils/navigation"
import { isPersonalWorkspace } from "../../utils/workspace"

const Team = () => {
  const { activeOrganization, role, isLoading } = useWorkspace()
  const workspaceName = activeOrganization?.name ?? "your workspace"

  if (!isLoading && isPersonalWorkspace(activeOrganization?.slug)) {
    return <Navigate to={routes.dashboard} replace />
  }

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Team"
        description={`Invite collaborators and manage roles across ${workspaceName}.`}
      >
        <div className="max-w-xl rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          {isLoading && !activeOrganization ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading workspace…</p>
          ) : (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                You are an{" "}
                <span className="font-medium capitalize text-accent">
                  {role ?? "member"}
                </span>{" "}
                in <span className="font-medium text-accent">{workspaceName}</span>.
              </p>
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                Member invites and role management are coming soon. Until then,
                access is limited to people already in this workspace.
              </p>
            </>
          )}
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Team
