import { docsFlatNav } from "../docs/nav"
import type { SeoConfig } from "./head"
import { absoluteUrl, getSiteUrl, SITE_NAME } from "./site"

const NOINDEX = "noindex, nofollow"
const INDEX = "index, follow"

const LANDING_DESCRIPTION =
  "AInvoker simplifies AI integration by providing a unified gateway to multiple providers. Manage API keys, monitor usage, and audit your AI applications with enterprise-grade security."

const LEGAL = {
  terms: {
    title: "Terms of Service",
    description:
      "The rules for using AInvoker’s dashboard, API, and related services.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How AInvoker collects, uses, and shares information when you use the dashboard and API.",
  },
} as const

function organizationJsonLd() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    sameAs: [
      "https://github.com/ainvoker",
      "https://twitter.com/ainvoker",
    ],
  }
}

function landingJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
      description: LANDING_DESCRIPTION,
      publisher: organizationJsonLd(),
    },
    {
      "@context": "https://schema.org",
      ...organizationJsonLd(),
    },
  ]
}

function docsJsonLd(title: string, description: string, pathname: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: absoluteUrl(pathname),
    publisher: organizationJsonLd(),
  }
}

function matchDocsSlug(pathname: string): string | null {
  if (!pathname.startsWith("/docs")) return null
  if (pathname === "/docs" || pathname === "/docs/") return "getting-started"
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "")
  return slug || null
}

type ResolveCtx = {
  isAuthenticated: boolean
}

export function resolveSeo(pathname: string, ctx: ResolveCtx): SeoConfig {
  const path = pathname.split("?")[0] || "/"

  if (path === "/") {
    if (ctx.isAuthenticated) {
      return {
        title: `Dashboard | ${SITE_NAME}`,
        description: "Workspace usage, quotas, and recent AI requests.",
        pathname: path,
        robots: NOINDEX,
      }
    }
    return {
      title: `${SITE_NAME} — Centralized AI Access & Management`,
      description: LANDING_DESCRIPTION,
      pathname: path,
      robots: INDEX,
      ogType: "website",
      jsonLd: landingJsonLd(),
    }
  }

  if (path === "/terms") {
    return {
      title: `${LEGAL.terms.title} | ${SITE_NAME}`,
      description: LEGAL.terms.description,
      pathname: path,
      robots: INDEX,
      ogType: "website",
    }
  }

  if (path === "/privacy") {
    return {
      title: `${LEGAL.privacy.title} | ${SITE_NAME}`,
      description: LEGAL.privacy.description,
      pathname: path,
      robots: INDEX,
      ogType: "website",
    }
  }

  const docsSlug = matchDocsSlug(path)
  if (docsSlug !== null) {
    const item = docsFlatNav.find((d) => d.slug === docsSlug)
    if (item) {
      const description =
        item.description ?? `${item.title} documentation for ${SITE_NAME}.`
      const title = `${item.title} | Docs | ${SITE_NAME}`
      const docPath = `/docs/${item.slug}`
      return {
        title,
        description,
        pathname: docPath,
        robots: INDEX,
        ogType: "article",
        jsonLd: docsJsonLd(item.title, description, docPath),
      }
    }
    return {
      title: `Documentation | ${SITE_NAME}`,
      description: `API and SDK documentation for ${SITE_NAME}.`,
      pathname: path,
      robots: INDEX,
      ogType: "article",
    }
  }

  const authPages: Record<string, { title: string; description: string }> = {
    "/login": {
      title: `Sign in | ${SITE_NAME}`,
      description: `Sign in to your ${SITE_NAME} account.`,
    },
    "/signup": {
      title: `Create account | ${SITE_NAME}`,
      description: `Create a ${SITE_NAME} account to get started.`,
    },
    "/forgot-password": {
      title: `Forgot password | ${SITE_NAME}`,
      description: `Reset your ${SITE_NAME} password.`,
    },
    "/verify-email": {
      title: `Verify email | ${SITE_NAME}`,
      description: `Verify your email for ${SITE_NAME}.`,
    },
    "/verify-reset-password": {
      title: `Verify password reset | ${SITE_NAME}`,
      description: `Confirm your password reset for ${SITE_NAME}.`,
    },
    "/reset-password": {
      title: `Reset password | ${SITE_NAME}`,
      description: `Choose a new password for ${SITE_NAME}.`,
    },
  }

  if (authPages[path]) {
    return {
      ...authPages[path],
      pathname: path,
      robots: NOINDEX,
    }
  }

  if (path.startsWith("/invites")) {
    return {
      title: `Accept invite | ${SITE_NAME}`,
      description: `Join a ${SITE_NAME} workspace.`,
      pathname: path,
      robots: NOINDEX,
    }
  }

  if (path.startsWith("/projects")) {
    let section = "Project"
    if (path.endsWith("/api-keys")) section = "API keys"
    else if (path.endsWith("/models")) section = "Models"
    else if (path.endsWith("/analytics")) section = "Analytics"
    else if (path.endsWith("/logs")) section = "Logs"
    else if (path.endsWith("/settings")) section = "Project settings"
    else if (path === "/projects") section = "Projects"
    return {
      title: `${section} | ${SITE_NAME}`,
      description: `${section} in your ${SITE_NAME} workspace.`,
      pathname: path,
      robots: NOINDEX,
    }
  }

  if (path.startsWith("/settings")) {
    let section = "Settings"
    if (path.includes("/billing/checkout")) section = "Checkout"
    else if (path.endsWith("/billing")) section = "Billing"
    else if (path.endsWith("/team")) section = "Team"
    else if (path.endsWith("/general")) section = "General"
    else if (path.endsWith("/profile")) section = "Profile"
    else if (path.endsWith("/appearance")) section = "Appearance"
    else if (path.endsWith("/security")) section = "Security"
    return {
      title: `${section} | ${SITE_NAME}`,
      description: `${section} settings for your ${SITE_NAME} workspace.`,
      pathname: path,
      robots: NOINDEX,
    }
  }

  if (path.startsWith("/billing") || path.startsWith("/team")) {
    return {
      title: `Workspace | ${SITE_NAME}`,
      description: `Workspace page in ${SITE_NAME}.`,
      pathname: path,
      robots: NOINDEX,
    }
  }

  return {
    title: `Page not found | ${SITE_NAME}`,
    description: `This page could not be found on ${SITE_NAME}.`,
    pathname: path,
    robots: NOINDEX,
  }
}
