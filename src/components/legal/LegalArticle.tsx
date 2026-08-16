import { NavLink } from "react-router-dom"
import { routes } from "../../utils/navigation"

type LegalArticleProps = {
  title: string
  description: string
  updated: string
  children: React.ReactNode
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-white text-accent"
      : "text-[#aaa] hover:bg-[#1a1a1a] hover:text-white",
  ].join(" ")

const LegalArticle = ({
  title,
  description,
  updated,
  children,
}: LegalArticleProps) => (
  <article className="mx-auto max-w-3xl py-8 md:py-12">
    <nav className="mb-8 inline-flex rounded-lg border border-[#2a2a2a] bg-[#161616] p-0.5" aria-label="Legal documents">
      <NavLink to={routes.terms} className={tabClass}>
        Terms of Service
      </NavLink>
      <NavLink to={routes.privacy} className={tabClass}>
        Privacy Policy
      </NavLink>
    </nav>

    <header className="mb-10 border-b border-[#222] pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-[#aaa]">{description}</p>
      <p className="mt-4 text-sm text-[#666]">Last updated {updated}</p>
    </header>

    <div className="space-y-6 text-[#ccc] leading-relaxed">{children}</div>
  </article>
)

export default LegalArticle
