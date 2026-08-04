import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useWorkspace } from "../../contexts/WorkspaceContext"

const Settings = () => {
  const { activeOrganization, role, isLoading } = useWorkspace()

  return (
    <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
      <WorkspacePage
        title="Settings"
        description="Workspace identity and account preferences."
      >
        <div className="max-w-xl space-y-4">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5">
            <h2 className="text-sm font-semibold text-accent">Workspace</h2>
            {isLoading && !activeOrganization ? (
              <p className="mt-3 text-sm text-neutral-500">Loading…</p>
            ) : activeOrganization ? (
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Name
                  </dt>
                  <dd className="mt-1 font-medium text-accent">
                    {activeOrganization.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Slug
                  </dt>
                  <dd className="mt-1 font-mono text-neutral-600">
                    {activeOrganization.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                    Your role
                  </dt>
                  <dd className="mt-1 capitalize text-neutral-600">
                    {role ?? "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                No workspace loaded.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5">
            <h2 className="text-sm font-semibold text-accent">Account</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Profile and security settings will live here.
            </p>
          </section>
        </div>
      </WorkspacePage>
    </main>
  )
}

export default Settings
