import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import {
  HiOutlineClipboardDocument,
  HiOutlineEnvelope,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi2"
import Button from "../../components/common/Button"
import InlineLoader from "../../components/common/InlineLoader"
import MenuSelect from "../../components/common/MenuSelect"
import UserAvatar from "../../components/common/UserAvatar"
import WorkspacePage from "../../components/workspace/WorkspacePage"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import MemberService, {
  type InviteItem,
  type InviteRole,
  type MemberListItem,
} from "../../services/MemberService"
import { routes } from "../../utils/navigation"
import { isPersonalWorkspace, teamPermissions } from "../../utils/workspace"

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-accent outline-none ring-accent/30 placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"

const ROLE_OPTIONS = [
  { value: "member", label: "Member", description: "Can view and use projects" },
  { value: "admin", label: "Admin", description: "Can invite and manage members" },
] as const

const ROLE_CHANGE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
] as const

function displayName(user: {
  firstName: string | null
  lastName: string | null
  email: string | null
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || user.email || "Unknown"
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return value
  }
}

const Team = () => {
  const navigate = useNavigate()
  const { token, user: authUser } = useAuth()
  const { activeOrganization, isLoading, refresh } = useWorkspace()
  const perms = teamPermissions(activeOrganization)

  const [members, setMembers] = useState<MemberListItem[]>([])
  const [invites, setInvites] = useState<InviteItem[]>([])
  const [isLoadingTeam, setIsLoadingTeam] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<InviteRole>("member")
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [createdInvite, setCreatedInvite] = useState<InviteItem | null>(null)
  const [copiedInvite, setCopiedInvite] = useState(false)

  const [busyInviteId, setBusyInviteId] = useState<string | null>(null)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const [transferMemberId, setTransferMemberId] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)

  const workspaceName = activeOrganization?.name ?? "your workspace"
  const currentUserId = authUser?.id ?? null

  const myMembership = useMemo(
    () => members.find((m) => m.user.id === currentUserId) ?? null,
    [members, currentUserId],
  )

  const transferCandidates = useMemo(
    () => members.filter((m) => m.user.id !== currentUserId),
    [members, currentUserId],
  )

  const loadTeam = useCallback(async () => {
    if (!token || !activeOrganization || perms.isPersonal) {
      setIsLoadingTeam(false)
      return
    }

    setIsLoadingTeam(true)
    setTeamError(null)

    const [memberData, memberErr] = await MemberService.listMembers(
      token,
      activeOrganization.id,
    )
    if (memberErr || !memberData) {
      setTeamError(memberErr ?? "Failed to load members")
      setMembers([])
      setInvites([])
      setIsLoadingTeam(false)
      return
    }
    setMembers(memberData)

    if (perms.canManageInvites) {
      const [inviteData, inviteErr] = await MemberService.listInvites(
        token,
        activeOrganization.id,
      )
      if (inviteErr || !inviteData) {
        setTeamError(inviteErr ?? "Failed to load invites")
        setInvites([])
      } else {
        setInvites(inviteData)
      }
    } else {
      setInvites([])
    }

    setIsLoadingTeam(false)
  }, [token, activeOrganization, perms.isPersonal, perms.canManageInvites])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  useEffect(() => {
    setCreatedInvite(null)
    setInviteEmail("")
    setInviteRole("member")
    setActionError(null)
    setTransferMemberId("")
  }, [activeOrganization?.id])

  if (!isLoading && isPersonalWorkspace(activeOrganization)) {
    return <Navigate to={routes.settingsGeneral} replace />
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedInvite(true)
      window.setTimeout(() => setCopiedInvite(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleCreateInvite = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !activeOrganization || !perms.canInvite) return

    const email = inviteEmail.trim().toLowerCase()
    if (!email) {
      setActionError("Email is required")
      return
    }

    setIsCreatingInvite(true)
    setActionError(null)
    const [invite, err] = await MemberService.createInvite(
      token,
      activeOrganization.id,
      { email, role: inviteRole },
    )
    setIsCreatingInvite(false)

    if (err || !invite) {
      setActionError(err?.message ?? "Failed to create invite")
      return
    }

    setCreatedInvite(invite)
    setInviteEmail("")
    setInvites((prev) => {
      const without = prev.filter((row) => row.id !== invite.id)
      return [{ ...invite, token: undefined, acceptUrl: undefined }, ...without]
    })
  }

  const handleRevoke = async (inviteId: string) => {
    if (!token || !activeOrganization) return
    if (!window.confirm("Revoke this invite? The link will stop working.")) return

    setBusyInviteId(inviteId)
    setActionError(null)
    const [, err] = await MemberService.revokeInvite(
      token,
      activeOrganization.id,
      inviteId,
    )
    setBusyInviteId(null)

    if (err) {
      setActionError(err.message)
      return
    }

    setInvites((prev) => prev.filter((row) => row.id !== inviteId))
    if (createdInvite?.id === inviteId) setCreatedInvite(null)
  }

  const handleResend = async (inviteId: string) => {
    if (!token || !activeOrganization) return

    setBusyInviteId(inviteId)
    setActionError(null)
    const [invite, err] = await MemberService.resendInvite(
      token,
      activeOrganization.id,
      inviteId,
    )
    setBusyInviteId(null)

    if (err || !invite) {
      setActionError(err?.message ?? "Failed to resend invite")
      return
    }

    setCreatedInvite(invite)
    setInvites((prev) =>
      prev.map((row) =>
        row.id === invite.id
          ? { ...invite, token: undefined, acceptUrl: undefined }
          : row,
      ),
    )
  }

  const handleRoleChange = async (member: MemberListItem, role: "admin" | "member") => {
    if (!token || !activeOrganization || !perms.canChangeRoles) return
    if (member.role === role) return
    if (member.role === "owner") return

    setBusyMemberId(member.id)
    setActionError(null)
    const [updated, err] = await MemberService.updateMemberRole(
      token,
      activeOrganization.id,
      member.id,
      { role },
    )
    setBusyMemberId(null)

    if (err || !updated) {
      setActionError(err?.message ?? "Failed to update role")
      return
    }

    setMembers((prev) => prev.map((row) => (row.id === updated.id ? updated : row)))
  }

  const handleRemove = async (member: MemberListItem) => {
    if (!token || !activeOrganization || !perms.canRemoveMembers) return
    if (member.role === "owner") return
    if (
      !window.confirm(
        `Remove ${displayName(member.user)} from ${workspaceName}?`,
      )
    ) {
      return
    }

    setBusyMemberId(member.id)
    setActionError(null)
    const [, err] = await MemberService.removeMember(
      token,
      activeOrganization.id,
      member.id,
    )
    setBusyMemberId(null)

    if (err) {
      setActionError(err.message)
      return
    }

    setMembers((prev) => prev.filter((row) => row.id !== member.id))
  }

  const handleLeave = async () => {
    if (!token || !activeOrganization || !perms.canLeave) return
    if (
      !window.confirm(
        `Leave ${workspaceName}? You will lose access until invited again.`,
      )
    ) {
      return
    }

    setIsLeaving(true)
    setActionError(null)
    const [, err] = await MemberService.leave(token, activeOrganization.id)
    setIsLeaving(false)

    if (err) {
      setActionError(err.message)
      return
    }

    await refresh()
    navigate(routes.settingsGeneral)
  }

  const handleTransfer = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !activeOrganization || !perms.canTransferOwnership) return
    if (!transferMemberId) {
      setActionError("Select a member to transfer ownership to")
      return
    }

    const target = members.find((m) => m.id === transferMemberId)
    if (
      !window.confirm(
        `Transfer ownership of ${workspaceName} to ${target ? displayName(target.user) : "this member"}? You will become an admin.`,
      )
    ) {
      return
    }

    setIsTransferring(true)
    setActionError(null)
    const [, err] = await MemberService.transferOwnership(
      token,
      activeOrganization.id,
      transferMemberId,
    )
    setIsTransferring(false)

    if (err) {
      setActionError(err.message)
      return
    }

    setTransferMemberId("")
    await refresh()
    await loadTeam()
  }

  const mailtoHref = createdInvite?.acceptUrl
    ? `mailto:${encodeURIComponent(createdInvite.email)}?subject=${encodeURIComponent(`Join ${workspaceName} on AInvoker`)}&body=${encodeURIComponent(`You're invited to join ${workspaceName} as ${createdInvite.role}.\n\nAccept the invite:\n${createdInvite.acceptUrl}\n\n(This email was not sent by AInvoker — paste the link yourself.)`)}`
    : null

  return (
    <WorkspacePage
      title="Team"
      description={`Invite collaborators and manage roles across ${workspaceName}.`}
    >
      <div className="flex max-w-3xl flex-col gap-6 pb-16">
        {isLoading && !activeOrganization ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <InlineLoader label="Loading workspace…" />
          </div>
        ) : (
          <>
            {actionError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                {actionError}
              </p>
            ) : null}

            {perms.canInvite ? (
              <section className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div>
                  <h2 className="text-sm font-semibold text-accent">Invite</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Create a link for someone to join. Email is not sent — copy
                    the link and share it yourself.
                  </p>
                </div>

                <form
                  onSubmit={(event) => void handleCreateInvite(event)}
                  className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <label className="min-w-0 flex-1 text-sm">
                    <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                      Email
                    </span>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="colleague@company.com"
                      className={inputClassName}
                      disabled={isCreatingInvite}
                      required
                    />
                  </label>
                  <label className="text-sm sm:w-44">
                    <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                      Role
                    </span>
                    <MenuSelect
                      value={inviteRole}
                      onChange={(next) => setInviteRole(next as InviteRole)}
                      options={[...ROLE_OPTIONS]}
                      disabled={isCreatingInvite}
                      aria-label="Invite role"
                    />
                  </label>
                  <Button
                    type="submit"
                    className="!px-3 !py-2.5 shrink-0 text-sm"
                    loading={isCreatingInvite}
                    disabled={!token}
                  >
                    Create invite
                  </Button>
                </form>

                {createdInvite?.acceptUrl ? (
                  <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950">
                    <p className="text-xs tracking-wide text-neutral-400 uppercase">
                      Invite link (shown once)
                    </p>
                    <p className="break-all font-mono text-xs text-accent">
                      {createdInvite.acceptUrl}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopy(createdInvite.acceptUrl!)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-white dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        <HiOutlineClipboardDocument className="size-4" aria-hidden />
                        {copiedInvite ? "Copied" : "Copy invite link"}
                      </button>
                      {mailtoHref ? (
                        <a
                          href={mailtoHref}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-white dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          <HiOutlineEnvelope className="size-4" aria-hidden />
                          Open mailto
                        </a>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Intended for {createdInvite.email} as {createdInvite.role}.
                      Email is not sent by AInvoker.
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {perms.canManageInvites ? (
              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-accent">Pending invites</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Revoke unused links or rotate a new one.
                  </p>
                </div>

                {teamError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                    {teamError}
                  </p>
                ) : null}

                {isLoadingTeam && invites.length === 0 ? (
                  <InlineLoader label="Loading invites…" />
                ) : invites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-10 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
                    <HiOutlineEnvelope
                      className="size-8 text-neutral-300 dark:text-neutral-600"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-medium text-accent">No pending invites</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Create an invite above to add someone new.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Expires</th>
                            <th className="px-4 py-3 font-medium">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invites.map((invite) => {
                            const busy = busyInviteId === invite.id
                            return (
                              <tr
                                key={invite.id}
                                className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                              >
                                <td className="px-4 py-3 text-accent">{invite.email}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-accent dark:bg-neutral-800">
                                    {invite.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                                  {formatDate(invite.expiresAt)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void handleResend(invite.id)}
                                      className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                    >
                                      {busy ? "…" : "Resend"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => void handleRevoke(invite.id)}
                                      className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            ) : null}

            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-accent">Members</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  People with access to this workspace.
                </p>
              </div>

              {isLoadingTeam && members.length === 0 ? (
                <InlineLoader label="Loading members…" />
              ) : members.length === 0 && !teamError ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
                  <HiOutlineUsers
                    className="size-8 text-neutral-300 dark:text-neutral-600"
                    aria-hidden
                  />
                  <p className="text-sm font-medium text-accent">No members yet</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="overflow-x-auto overflow-y-visible">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                          <th className="px-4 py-3 font-medium">Person</th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Joined</th>
                          <th className="px-4 py-3 font-medium">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => {
                          const busy = busyMemberId === member.id
                          const isSelf = member.user.id === currentUserId
                          const canEditRole =
                            perms.canChangeRoles &&
                            !isSelf &&
                            member.role !== "owner"
                          const canRemove =
                            perms.canRemoveMembers &&
                            !isSelf &&
                            member.role !== "owner"

                          return (
                            <tr
                              key={member.id}
                              className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <UserAvatar
                                    src={member.user.profilePicture}
                                    name={displayName(member.user)}
                                    email={member.user.email}
                                    className="size-8"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-accent">
                                      {displayName(member.user)}
                                      {isSelf ? (
                                        <span className="ml-1.5 text-xs font-normal text-neutral-400">
                                          (you)
                                        </span>
                                      ) : null}
                                    </p>
                                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                      {member.user.email ?? "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {canEditRole ? (
                                  <MenuSelect
                                    value={member.role}
                                    disabled={busy}
                                    size="compact"
                                    className="w-[7.5rem]"
                                    aria-label={`Role for ${displayName(member.user)}`}
                                    options={[...ROLE_CHANGE_OPTIONS]}
                                    onChange={(next) =>
                                      void handleRoleChange(
                                        member,
                                        next as "admin" | "member",
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-accent dark:bg-neutral-800">
                                    {member.role}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                                {formatDate(member.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {canRemove ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void handleRemove(member)}
                                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {myMembership && perms.canLeave ? (
              <section className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-start gap-3">
                  <HiOutlineUserGroup
                    className="mt-0.5 size-5 shrink-0 text-neutral-400"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <h2 className="text-sm font-semibold text-accent">Your membership</h2>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        You are an{" "}
                        <span className="font-medium capitalize text-accent">
                          {myMembership.role}
                        </span>{" "}
                        in this workspace.
                      </p>
                    </div>

                    {perms.canTransferOwnership && transferCandidates.length > 0 ? (
                      <form
                        onSubmit={(event) => void handleTransfer(event)}
                        className="flex flex-col gap-3 sm:flex-row sm:items-end"
                      >
                        <label className="min-w-0 flex-1 text-sm">
                          <span className="mb-1.5 block text-xs tracking-wide text-neutral-400 uppercase">
                            Transfer ownership
                          </span>
                          <MenuSelect
                            value={transferMemberId}
                            onChange={setTransferMemberId}
                            placeholder="Choose a member…"
                            disabled={isTransferring}
                            aria-label="Transfer ownership to"
                            options={transferCandidates.map((m) => ({
                              value: m.id,
                              label: displayName(m.user),
                              description: `${m.role}${m.user.email ? ` · ${m.user.email}` : ""}`,
                              leading: (
                                <UserAvatar
                                  src={m.user.profilePicture}
                                  name={displayName(m.user)}
                                  email={m.user.email}
                                  className="size-6"
                                />
                              ),
                            }))}
                          />
                        </label>
                        <Button
                          type="submit"
                          className="!px-3 !py-2.5 shrink-0 text-sm"
                          loading={isTransferring}
                          disabled={!transferMemberId}
                        >
                          Transfer
                        </Button>
                      </form>
                    ) : null}

                    <div>
                      <Button
                        type="button"
                        className="!bg-transparent !px-3 !py-2.5 text-sm !text-red-600 ring-1 ring-red-200 hover:!bg-red-50 dark:!text-red-400 dark:ring-red-900/60 dark:hover:!bg-red-950/40"
                        loading={isLeaving}
                        onClick={() => void handleLeave()}
                      >
                        Leave workspace
                      </Button>
                      {myMembership.role === "owner" ? (
                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                          As the owner, transfer ownership before you can leave.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </WorkspacePage>
  )
}

export default Team
