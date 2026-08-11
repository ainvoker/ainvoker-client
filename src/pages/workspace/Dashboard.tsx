import WorkspacePage from "../../components/workspace/WorkspacePage"

const Dashboard = () => {

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Dashboard"
        description="Monitor inference traffic, model health, and infrastructure spend across your workspace."
      />
    </main>
  )
}

export default Dashboard
