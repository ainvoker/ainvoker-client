import { Link } from "react-router-dom"
import { getDocsPrevNext } from "../../docs/nav"

type DocsArticleProps = {
  slug: string
  title: string
  description?: string
  children: React.ReactNode
}

const DocsArticle = ({ slug, title, description, children }: DocsArticleProps) => {
  const { prev, next } = getDocsPrevNext(slug)

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-10 border-b border-[#222] pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-lg leading-relaxed text-[#aaa]">{description}</p>
        ) : null}
      </header>

      <div className="docs-prose space-y-6 text-[#ccc] leading-relaxed">{children}</div>

      <nav
        className="mt-16 grid grid-cols-1 gap-4 border-t border-[#222] pt-8 sm:grid-cols-2"
        aria-label="Page navigation"
      >
        {prev ? (
          <Link
            to={`/docs/${prev.slug}`}
            className="rounded-lg border border-[#2a2a2a] bg-[#161616] px-4 py-3 transition hover:border-[#444] hover:bg-[#1a1a1a]"
          >
            <span className="block text-xs text-[#666]">Previous</span>
            <span className="mt-0.5 block text-sm font-medium text-white">{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/docs/${next.slug}`}
            className="rounded-lg border border-[#2a2a2a] bg-[#161616] px-4 py-3 text-right transition hover:border-[#444] hover:bg-[#1a1a1a] sm:justify-self-end sm:text-right"
          >
            <span className="block text-xs text-[#666]">Next</span>
            <span className="mt-0.5 block text-sm font-medium text-white">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  )
}

export default DocsArticle
