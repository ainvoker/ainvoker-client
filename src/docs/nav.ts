export type DocsNavItem = {
  slug: string
  title: string
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

export const docsNav: DocsNavSection[] = [
  {
    title: "Get started",
    items: [
      { slug: "getting-started", title: "Getting Started" },
      { slug: "authentication", title: "Authentication" },
      { slug: "api-keys", title: "API Keys" },
    ],
  },
  {
    title: "API",
    items: [
      { slug: "text-chat", title: "Text Chat" },
      { slug: "models", title: "Models" },
      { slug: "limits", title: "Limits" },
      { slug: "errors", title: "Errors" },
    ],
  },
  {
    title: "SDK",
    items: [
      { slug: "sdk", title: "Overview" },
      { slug: "sdk/nodejs", title: "Node.js" },
      { slug: "sdk/browser", title: "Browser" },
    ],
  },
]

export const docsFlatNav: DocsNavItem[] = docsNav.flatMap((section) => section.items)

export function getDocsPrevNext(slug: string) {
  const index = docsFlatNav.findIndex((item) => item.slug === slug)
  if (index < 0) {
    return { prev: null, next: null }
  }
  return {
    prev: index > 0 ? docsFlatNav[index - 1] : null,
    next: index < docsFlatNav.length - 1 ? docsFlatNav[index + 1] : null,
  }
}

export const DOCS_BASE_URL = "https://ainvoker-api.onrender.com"
