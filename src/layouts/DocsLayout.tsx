import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2"
import Logo from "../assets/logo.svg"
import DocsSidebar from "../components/docs/DocsSidebar"

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-accent text-white">
      <header className="sticky top-0 z-40 border-b border-[#222] bg-accent/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-9 place-content-center rounded-md text-[#ccc] hover:bg-[#1a1a1a] hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open documentation menu"
            >
              <HiOutlineBars3 className="size-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src={Logo} alt="" className="h-5" />
              <span className="text-sm font-semibold tracking-tight">AInvoker</span>
            </Link>
            <span className="hidden text-[#444] sm:inline">/</span>
            <Link to="/docs" className="hidden text-sm text-[#aaa] hover:text-white sm:inline">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#ccc] hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-accent hover:brightness-95"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close documentation menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex max-w-7xl">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-[#222] bg-accent px-4 py-6 transition-transform duration-300 lg:static lg:z-0 lg:h-[calc(100vh-3.5rem)] lg:shrink-0 lg:translate-x-0 lg:sticky lg:top-14",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="text-sm font-semibold">Documentation</span>
            <button
              type="button"
              className="grid size-8 place-content-center rounded-md text-[#888] hover:bg-[#1a1a1a] hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close documentation menu"
            >
              <HiOutlineXMark className="size-4" />
            </button>
          </div>
          <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-10 md:px-8 lg:px-12 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DocsLayout
