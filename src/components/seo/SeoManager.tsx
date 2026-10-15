import { useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { usePageSeo } from "../../seo/head"
import { resolveSeo } from "../../seo/resolveSeo"

/**
 * Applies document title, meta, canonical, and JSON-LD for the current route.
 * Mount once under BrowserRouter (and AuthProvider) so guest vs dashboard `/` differs.
 */
const SeoManager = () => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const config = resolveSeo(pathname, { isAuthenticated: Boolean(user) })
  usePageSeo(config)
  return null
}

export default SeoManager
