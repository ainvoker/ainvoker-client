import WorkspacePage from "../../../components/workspace/WorkspacePage"
import ThemeToggle from "../../../components/common/ThemeToggle"

const Appearance = () => {
  return (
    <WorkspacePage
      title="Appearance"
      description="Choose how AInvoker looks for your account across workspaces."
    >
      <div className="max-w-2xl space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div>
          <p className="text-sm font-medium text-accent">Theme</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Device follows your system preference. Light and Dark stay fixed
            until you change them.
          </p>
          <ThemeToggle className="mt-4" />
        </div>
      </div>
    </WorkspacePage>
  )
}

export default Appearance
