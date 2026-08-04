type UserAvatarProps = {
  src?: string | null
  name?: string | null
  email?: string | null
  className?: string
}

function initialsFrom(name?: string | null, email?: string | null) {
  const trimmed = name?.trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return trimmed.slice(0, 2).toUpperCase()
  }

  const local = email?.trim().split("@")[0]
  if (local) return local.slice(0, 2).toUpperCase()
  return "?"
}

const UserAvatar = ({ src, name, email, className = "size-8" }: UserAvatarProps) => {
  const initials = initialsFrom(name, email)

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} shrink-0 rounded-full object-cover`}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`${className} grid shrink-0 place-content-center rounded-full bg-neutral-200 text-[11px] font-semibold tracking-wide text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200`}
    >
      {initials}
    </div>
  )
}

export default UserAvatar
