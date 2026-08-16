import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { formatAppUserName } from "../../services/UserService"
import { routes } from "../../utils/navigation"
import Skeleton from "./Skeleton"
import UserAvatar from "./UserAvatar"

const PublicAuthActions = () => {
  const { user, isLoading, appBootstrap } = useAuth()

  if (isLoading) {
    return (
      <Skeleton className="size-8 shrink-0 rounded-full bg-[#2a2a2a] dark:bg-neutral-700" />
    )
  }

  if (user) {
    const appUser = appBootstrap?.user
    const displayName =
      formatAppUserName(appUser) || user.name?.trim() || "Account"
    const email = appUser?.email ?? user.email ?? null
    const avatarSrc = appUser?.profilePicture ?? user.image ?? null

    return (
      <Link
        to={routes.dashboard}
        className="rounded-full outline-none ring-white/40 transition hover:opacity-90 focus-visible:ring-2"
        aria-label={`Open dashboard as ${displayName}`}
      >
        <UserAvatar
          src={avatarSrc}
          name={displayName}
          email={email}
          className="size-8"
        />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#ccc] hover:text-white"
      >
        Sign in
      </Link>
      <Link
        to="/signup"
        className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-accent hover:brightness-95"
      >
        Sign up
      </Link>
    </div>
  )
}

export default PublicAuthActions
