import { NavLink } from "react-router-dom"
import { docsNav } from "../../docs/nav"

type DocsSidebarProps = {
  onNavigate?: () => void
}

const DocsSidebar = ({ onNavigate }: DocsSidebarProps) => {
  return (
    <nav className="space-y-8" aria-label="Documentation">
      {docsNav.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[#666]">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.slug}>
                <NavLink
                  to={`/docs/${item.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-2 py-1.5 text-sm transition",
                      isActive
                        ? "bg-[#222] font-medium text-white"
                        : "text-[#aaa] hover:bg-[#1a1a1a] hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default DocsSidebar
