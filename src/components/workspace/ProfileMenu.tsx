import { useEffect, useId, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBookOpen,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineUserCircle,
} from "react-icons/hi2"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import AuthService from "../../services/AuthService"
import { formatAppUserName } from "../../services/UserService"
import { routes } from "../../utils/navigation"
import ThemeToggle from "../common/ThemeToggle"
import UserAvatar from "../common/UserAvatar"

type ProfileMenuProps = {
  onNavigate?: () => void
}

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"

const ProfileMenu = ({ onNavigate }: ProfileMenuProps) => {
  const navigate = useNavigate()
  const { appBootstrap, refresh } = useAuth()
  const { activeOrganization } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const appUser = appBootstrap?.user
  const avatarSrc = appUser?.profilePicture ?? null
  const displayName = formatAppUserName(appUser) || "Account"
  const email = appUser?.email ?? null
  const workspaceName = activeOrganization?.name ?? "Workspace"
  const workspaceInitial = workspaceName.trim().charAt(0).toUpperCase() || "W"

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    onNavigate?.()
    navigate(path)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await AuthService.signout()
    await refresh()
    setIsLoggingOut(false)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
      >
        <UserAvatar
          src={avatarSrc}
          name={displayName}
          email={email}
          className="size-8"
        />
        <div className="min-w-0 flex-1 truncate">
          <p className="truncate text-[13px] font-medium text-accent">
            {displayName}
          </p>
          <p className="truncate text-[12px] text-neutral-400">{email}</p>
        </div>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          className="absolute bottom-full left-0 z-50 mb-2 w-[17.5rem] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="border-b border-neutral-100 px-3 py-3 dark:border-neutral-800">
            <p className="truncate px-1 text-[12px] text-neutral-500 dark:text-neutral-400">
              {email}
            </p>
            <ThemeToggle compact className="mt-2.5" />
          </div>

          <div className="border-b border-neutral-100 p-1.5 dark:border-neutral-800">
            <button
              type="button"
              role="menuitem"
              onClick={() => go(`${routes.settings}#workspace`)}
              className={menuItemClass}
            >
              <div className="grid size-7 shrink-0 place-content-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {workspaceInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-accent">{workspaceName}</p>
                <p className="truncate text-[11px] text-neutral-400">Workspace</p>
              </div>
            </button>
          </div>

          <div className="border-b border-neutral-100 p-1.5 dark:border-neutral-800">
            <button
              type="button"
              role="menuitem"
              onClick={() => go(`${routes.settings}#workspace`)}
              className={menuItemClass}
            >
              <HiOutlineBuildingOffice2 className="size-4 shrink-0 opacity-70" aria-hidden />
              Workspace settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => go(`${routes.settings}#account`)}
              className={menuItemClass}
            >
              <HiOutlineUserCircle className="size-4 shrink-0 opacity-70" aria-hidden />
              Profile settings
            </button>
          </div>

          <div className="border-b border-neutral-100 p-1.5 dark:border-neutral-800">
            <Link
              to={routes.docs}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={menuItemClass}
            >
              <HiOutlineBookOpen className="size-4 shrink-0 opacity-70" aria-hidden />
              Documentation
            </Link>
            <Link
              to={routes.terms}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={menuItemClass}
            >
              <HiOutlineDocumentText className="size-4 shrink-0 opacity-70" aria-hidden />
              Terms & policies
            </Link>
            <Link
              to={routes.privacy}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={menuItemClass}
            >
              <HiOutlineShieldCheck className="size-4 shrink-0 opacity-70" aria-hidden />
              Privacy
            </Link>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className={`${menuItemClass} disabled:opacity-60`}
            >
              <HiOutlineArrowRightOnRectangle className="size-4 shrink-0 opacity-70" aria-hidden />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProfileMenu
