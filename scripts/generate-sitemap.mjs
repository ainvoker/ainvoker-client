import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, "..")

const SITE_URL = (process.env.VITE_SITE_URL || "https://app.ainvoker.dev").replace(
  /\/+$/,
  "",
)

/** Keep in sync with src/docs/nav.ts slugs. */
const DOC_SLUGS = [
  "getting-started",
  "authentication",
  "api-keys",
  "text-chat",
  "text-stream",
  "image-generate",
  "models",
  "limits",
  "errors",
  "sdk",
  "sdk/nodejs",
  "sdk/browser",
]

const STATIC_PATHS = ["/", "/terms", "/privacy"]

function loc(pathname) {
  if (!pathname || pathname === "/") return `${SITE_URL}/`
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${SITE_URL}${path}`
}

const urls = [
  ...STATIC_PATHS.map((path) => ({ loc: loc(path), priority: path === "/" ? "1.0" : "0.6" })),
  ...DOC_SLUGS.map((slug) => ({ loc: loc(`/docs/${slug}`), priority: "0.8" })),
]

const today = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc: href, priority }) => `  <url>
    <loc>${href}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`

const outPath = join(rootDir, "public", "sitemap.xml")
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, xml, "utf8")
console.log(`Wrote ${outPath} (${urls.length} URLs, base ${SITE_URL})`)
