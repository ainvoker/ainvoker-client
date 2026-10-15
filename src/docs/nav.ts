export type DocsNavItem = {
  slug: string
  title: string
  description: string
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

export const docsNav: DocsNavSection[] = [
  {
    title: "Get started",
    items: [
      {
        slug: "getting-started",
        title: "Getting Started",
        description:
          "Create an account, grab a project API key, and make your first text chat request.",
      },
      {
        slug: "authentication",
        title: "Authentication",
        description: "API requests authenticate with a project API key.",
      },
      {
        slug: "api-keys",
        title: "API Keys",
        description:
          "Project API keys unlock the API. Create them in the dashboard and treat the secret as a password.",
      },
    ],
  },
  {
    title: "API",
    items: [
      {
        slug: "text-chat",
        title: "Text Chat",
        description: "Send a conversation and receive a complete assistant reply.",
      },
      {
        slug: "text-stream",
        title: "Text Stream",
        description:
          "Stream an assistant reply over Server-Sent Events with the same models and gates as chat.",
      },
      {
        slug: "image-generate",
        title: "Image Generation",
        description: "Generate images from a text prompt.",
      },
      {
        slug: "models",
        title: "Models",
        description:
          "Pass a provider/model slug on every chat request. Free plans can only use models available on Free.",
      },
      {
        slug: "limits",
        title: "Limits",
        description:
          "Request and token quotas apply per workspace plan and reset each billing period.",
      },
      {
        slug: "errors",
        title: "Errors",
        description:
          "API failures use a consistent JSON format. Success responses wrap the result in data.",
      },
    ],
  },
  {
    title: "SDK",
    items: [
      {
        slug: "sdk",
        title: "Overview",
        description: "The official TypeScript/JavaScript package for the AInvoker API.",
      },
      {
        slug: "sdk/nodejs",
        title: "Node.js",
        description:
          "Use the official SDK from Node.js 18+ with an environment-backed API key.",
      },
      {
        slug: "sdk/browser",
        title: "Browser",
        description:
          "Prefer a backend proxy. Direct browser calls need an allowed app URL.",
      },
    ],
  },
]

export const docsFlatNav: DocsNavItem[] = docsNav.flatMap((section) => section.items)

export function getDocsNavItem(slug: string): DocsNavItem | undefined {
  return docsFlatNav.find((item) => item.slug === slug)
}

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

export const DOCS_BASE_URL = "https://api.ainvoker.dev"
