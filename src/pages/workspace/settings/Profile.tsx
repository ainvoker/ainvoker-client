import { type FormEvent, useEffect, useState } from "react"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import UserAvatar from "../../../components/common/UserAvatar"
import Button from "../../../components/common/Button"
import { useAuth } from "../../../contexts/AuthContext"
import UserService, { formatAppUserName } from "../../../services/UserService"

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const Profile = () => {
  const { token, appBootstrap, patchAppUser } = useAuth()
  const appUser = appBootstrap?.user
  const displayName = formatAppUserName(appUser) || "Account"
  const avatarSrc = appUser?.profilePicture ?? null
  const email = appUser?.email ?? null

  const [firstName, setFirstName] = useState(appUser?.firstName ?? "")
  const [lastName, setLastName] = useState(appUser?.lastName ?? "")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)

  useEffect(() => {
    setFirstName(appUser?.firstName ?? "")
    setLastName(appUser?.lastName ?? "")
  }, [appUser?.firstName, appUser?.lastName])

  const profileDirty =
    firstName.trim() !== (appUser?.firstName ?? "") ||
    lastName.trim() !== (appUser?.lastName ?? "")

  const handleCancel = () => {
    setFirstName(appUser?.firstName ?? "")
    setLastName(appUser?.lastName ?? "")
    setProfileError(null)
    setProfileSuccess(null)
  }

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    if (!trimmedFirst) {
      setProfileError("First name is required")
      setProfileSuccess(null)
      return
    }

    setIsSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    const [updated, err] = await UserService.updateProfile(token, {
      firstName: trimmedFirst,
      lastName: trimmedLast.length > 0 ? trimmedLast : null,
    })
    setIsSavingProfile(false)

    if (err || !updated) {
      setProfileError(err ?? "Failed to save profile")
      return
    }

    patchAppUser(updated)
    setFirstName(updated.firstName ?? "")
    setLastName(updated.lastName ?? "")
    setProfileSuccess("Profile saved")
  }

  return (
    <WorkspacePage
      title="Profile"
      description="Your name and account details across workspaces."
    >
      <form
        onSubmit={(event) => void handleSaveProfile(event)}
        className="max-w-2xl space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="flex items-center gap-3">
          <UserAvatar
            src={avatarSrc}
            name={displayName}
            email={email}
            className="size-11"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-accent">
              {displayName}
            </p>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              {email ?? "No email on file"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
              First name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={inputClassName}
              disabled={isSavingProfile || !token}
              maxLength={100}
              required
              autoComplete="given-name"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
              Last name
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
              disabled={isSavingProfile || !token}
              maxLength={100}
              autoComplete="family-name"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
            Email
          </span>
          <input
            type="email"
            value={email ?? ""}
            className={`${inputClassName} bg-neutral-50 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400`}
            disabled
            readOnly
          />
        </label>

        {profileError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>
        ) : null}
        {profileSuccess ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {profileSuccess}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          {profileDirty ? (
            <Button
              type="button"
              className="!bg-transparent !px-4 !py-2.5 text-sm !text-neutral-600 ring-1 ring-neutral-200 hover:!bg-neutral-50 dark:!text-neutral-300 dark:ring-neutral-700 dark:hover:!bg-neutral-800"
              disabled={isSavingProfile}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            className="!px-4 !py-2.5 text-sm"
            loading={isSavingProfile}
            disabled={!token || !profileDirty}
          >
            Save changes
          </Button>
        </div>
      </form>
    </WorkspacePage>
  )
}

export default Profile
