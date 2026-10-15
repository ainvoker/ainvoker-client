import { useEffect } from "react"
import { absoluteAssetUrl, absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_NAME } from "./site"

export type SeoConfig = {
  title: string
  description: string
  pathname: string
  robots?: string
  ogType?: "website" | "article"
  /** Relative path under site origin; defaults to og-default.jpg */
  imagePath?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null
}

const ATTR = "data-ainvoker-seo"

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"][${ATTR}]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    el.setAttribute(ATTR, "")
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function upsertLink(rel: string, href: string): void {
  const selector = `link[rel="${rel}"][${ATTR}]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    el.setAttribute(ATTR, "")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
  const selector = `script[type="application/ld+json"][${ATTR}]`
  let el = document.head.querySelector<HTMLScriptElement>(selector)
  if (!el) {
    el = document.createElement("script")
    el.setAttribute("type", "application/ld+json")
    el.setAttribute(ATTR, "")
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeSeoTags(): void {
  document.head.querySelectorAll(`[${ATTR}]`).forEach((node) => node.remove())
}

export function applyPageSeo(config: SeoConfig): void {
  const {
    title,
    description,
    pathname,
    robots = "index, follow",
    ogType = "website",
    imagePath = DEFAULT_OG_IMAGE_PATH,
    jsonLd = null,
  } = config

  const url = absoluteUrl(pathname)
  const image = absoluteAssetUrl(imagePath)

  document.title = title

  upsertMeta("name", "description", description)
  upsertMeta("name", "robots", robots)

  upsertLink("canonical", url)

  upsertMeta("property", "og:type", ogType)
  upsertMeta("property", "og:url", url)
  upsertMeta("property", "og:title", title)
  upsertMeta("property", "og:description", description)
  upsertMeta("property", "og:site_name", SITE_NAME)
  upsertMeta("property", "og:image", image)

  upsertMeta("name", "twitter:card", "summary_large_image")
  upsertMeta("name", "twitter:title", title)
  upsertMeta("name", "twitter:description", description)
  upsertMeta("name", "twitter:image", image)

  if (jsonLd) {
    upsertJsonLd(jsonLd)
  } else {
    document.head
      .querySelectorAll(`script[type="application/ld+json"][${ATTR}]`)
      .forEach((node) => node.remove())
  }
}

export function usePageSeo(config: SeoConfig): void {
  const jsonLdKey = config.jsonLd ? JSON.stringify(config.jsonLd) : ""

  useEffect(() => {
    applyPageSeo(config)
    return () => {
      removeSeoTags()
    }
    // Intentionally key on primitive fields so callers can pass fresh objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config object identity is unstable
  }, [
    config.title,
    config.description,
    config.pathname,
    config.robots,
    config.ogType,
    config.imagePath,
    jsonLdKey,
  ])
}
