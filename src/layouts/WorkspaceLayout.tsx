import { useState } from "react"
import { Outlet } from "react-router-dom"
import AppSidebar from "../components/workspace/AppSidebar"
import { useTheme } from "../contexts/ThemeContext"

type WorkspaceLayoutProps = {
  children?: React.ReactNode
}

/**
 * Authenticated app shell.
 * Sidebar always shows workspace nav; project nav appends below on project routes.
 * Supports children (Home `/`) or nested Outlet.
 * Dark mode is scoped here so marketing/auth pages stay light.
 */
const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={[
        "flex h-svh overflow-hidden bg-[#f4f4f5] text-accent selection:bg-[#dddddd] selection:text-accent",
        isDark ? "dark bg-neutral-950 dark:selection:bg-neutral-700" : "",
      ].join(" ")}
      style={{ colorScheme: isDark ? "dark" : "light" }}
    >
      <AppSidebar
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pt-14 md:pt-0">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 100% -10%, rgba(17,17,17,0.06), transparent), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(17,17,17,0.04), transparent)",
          }}
        />
        {children ?? <Outlet />}
      </div>
    </div>
  )
}

export default WorkspaceLayout
