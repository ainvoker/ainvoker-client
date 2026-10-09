import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import Button from "../../components/common/Button"
import InlineLoader from "../../components/common/InlineLoader"
import { useAuth } from "../../contexts/AuthContext"
import { useWorkspace } from "../../contexts/WorkspaceContext"
import MemberService, { type InvitePreview } from "../../services/MemberService"
import { routes } from "../../utils/navigation"
import { clearPersistedInviteNext } from "../../utils/inviteRedirect"
import { writeStoredOrganizationId } from "../../utils/workspace"

const AcceptInvite = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token, isLoading: authLoading } = useAuth()
  const { refresh } = useWorkspace()

  const inviteToken = searchParams.get("token")?.trim() ?? ""

  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteToken) {
      setPreviewError("Missing invite token")
      setIsPreviewLoading(false)
      return
    }

    let cancelled = false
    setIsPreviewLoading(true)
    setPreviewError(null)

    void (async () => {
      const [data, err] = await MemberService.previewInvite(token, inviteToken)
      if (cancelled) return
      if (err || !data) {
        setPreviewError(err ?? "Invite not found")
        setPreview(null)
        setIsPreviewLoading(false)
        return
      }
      setPreview(data)
      setIsPreviewLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [inviteToken, token])

  const canAccept =
    preview?.status === "PENDING" &&
    new Date(preview.expiresAt).getTime() > Date.now()

  const handleAccept = async () => {
    if (!token || !inviteToken) return

    setIsAccepting(true)
    setAcceptError(null)
    const [result, err] = await MemberService.acceptInvite(token, inviteToken)
    setIsAccepting(false)

    if (err || !result) {
      setAcceptError(err?.message ?? "Failed to accept invite")
      return
    }

    clearPersistedInviteNext()
    writeStoredOrganizationId(result.organization.id)
    await refresh()
    navigate(routes.settingsTeam, { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f4f4f5] px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div>
          <p className="text-xs tracking-wide text-neutral-400 uppercase">Invite</p>
          <h1 className="mt-1 text-xl font-semibold text-accent">Join a workspace</h1>
        </div>

        {authLoading || isPreviewLoading ? (
          <InlineLoader label="Loading invite…" />
        ) : previewError ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {previewError}
            </p>
            <Link
              to={routes.projects}
              className="text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              Back to projects
            </Link>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                  Workspace
                </dt>
                <dd className="mt-1 font-medium text-accent">
                  {preview.organizationName}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-neutral-400 uppercase">Role</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-accent dark:bg-neutral-800">
                    {preview.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                  Invited email
                </dt>
                <dd className="mt-1 text-neutral-600 dark:text-neutral-300">
                  {preview.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-neutral-400 uppercase">
                  Status
                </dt>
                <dd className="mt-1 capitalize text-neutral-600 dark:text-neutral-300">
                  {preview.status.toLowerCase()}
                </dd>
              </div>
            </dl>

            {acceptError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                {acceptError}
              </p>
            ) : null}

            {!canAccept ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                This invite can no longer be accepted.
              </p>
            ) : (
              <Button
                type="button"
                className="w-full text-sm"
                loading={isAccepting}
                onClick={() => void handleAccept()}
              >
                Accept invite
              </Button>
            )}

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Your signed-in account email must match {preview.email}.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AcceptInvite
