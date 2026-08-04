import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useWorkspace } from "../../contexts/WorkspaceContext"

const Billing = () => {
  const { activeOrganization } = useWorkspace()
  const workspaceName = activeOrganization?.name ?? "your workspace"

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Billing"
        description={`Usage-based spend, invoices, and plan limits for ${workspaceName}.`}
      />
    </main>
  )
}

export default Billing
