import { Navigate, useLocation } from "react-router-dom"
import { routes } from "../../../utils/navigation"

/** Redirect /settings and legacy hash targets to nested settings routes. */
const SettingsIndexRedirect = () => {
  const location = useLocation()
  const hash = location.hash.replace(/^#/, "")

  if (hash === "account") {
    return <Navigate to={routes.settingsProfile} replace />
  }

  return <Navigate to={routes.settingsGeneral} replace />
}

export default SettingsIndexRedirect
