/** Canonical production host (no scheme). */
export const SITE_HOST = "app.ainvoker.dev"

/** Canonical production origin. */
export const DEFAULT_SITE_URL = `https://${SITE_HOST}`

export const SITE_NAME = "AInvoker"

export const DEFAULT_OG_IMAGE_PATH = "/og-default.jpg"

export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
export const DEFAULT_OG_IMAGE_ALT =
  "AInvoker — centralized AI access and management gateway"

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined
  const raw = (fromEnv?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "")
  return raw || DEFAULT_SITE_URL
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl()
  if (!pathname || pathname === "/") return `${base}/`
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${base}${path}`
}

export function absoluteAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`
  return `${getSiteUrl()}${path}`
}
