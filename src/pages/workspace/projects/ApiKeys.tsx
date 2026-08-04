import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { HiOutlineKey, HiOutlinePlus } from "react-icons/hi2"
import WorkspacePage from "../../../components/workspace/WorkspacePage"
import CreateApiKeyModal from "../../../components/workspace/CreateApiKeyModal"
import RevealApiKeyModal from "../../../components/workspace/RevealApiKeyModal"
import Button from "../../../components/common/Button"
import { useAuth } from "../../../contexts/AuthContext"
import ApiKeyService, {
  type ApiKey,
  type CreateApiKeyInput,
  type CreatedApiKey,
} from "../../../services/ApiKeyService"

const formatDate = (value: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  if (!normalized) return "—"
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusClass = (status: string) => {
  const normalized = status.trim().toUpperCase()
  if (normalized === "ACTIVE" || normalized === "ENABLED") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
  }
  if (normalized === "REVOKED" || normalized === "DISABLED" || normalized === "EXPIRED") {
    return "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
  }
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
}

const ApiKeys = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { token } = useAuth()

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyKeyId, setBusyKeyId] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [revealedKey, setRevealedKey] = useState<CreatedApiKey | null>(null)

  const loadKeys = useCallback(async () => {
    if (!token || !projectId) {
      setKeys([])
      setIsLoading(false)
      setError(!projectId ? "Missing project" : "Not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    const [data, err] = await ApiKeyService.list(token, projectId)
    if (err || !data) {
      setKeys([])
      setError(err ?? "Failed to load API keys")
      setIsLoading(false)
      return
    }

    setKeys(data)
    setIsLoading(false)
  }, [token, projectId])

  useEffect(() => {
    void loadKeys()
  }, [loadKeys])

  const handleCreate = async (
    input: CreateApiKeyInput,
  ): Promise<[CreatedApiKey | null, string | undefined]> => {
    if (!token || !projectId) {
      return [null, "Not authenticated"]
    }

    setActionError(null)
    const [created, err] = await ApiKeyService.create(token, projectId, input)
    if (err || !created) {
      return [null, err ?? "Failed to create API key"]
    }

    setKeys((prev) => {
      const withoutSecret: ApiKey = {
        id: created.id,
        projectId: created.projectId,
        keyName: created.keyName,
        keyPrefix: created.keyPrefix,
        permissions: created.permissions,
        lastUsed: created.lastUsed,
        expiresAt: created.expiresAt,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      }
      return [withoutSecret, ...prev.filter((k) => k.id !== created.id)]
    })
    setRevealedKey(created)
    return [created, undefined]
  }

  const handleRevoke = async (key: ApiKey) => {
    if (!token || !projectId) return
    const confirmed = window.confirm(
      `Revoke “${key.keyName}”? Traffic using this key will stop working.`,
    )
    if (!confirmed) return

    setBusyKeyId(key.id)
    setActionError(null)
    const [updated, err] = await ApiKeyService.revoke(token, projectId, key.id)
    setBusyKeyId(null)

    if (err || !updated) {
      setActionError(err ?? "Failed to revoke API key")
      return
    }

    setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)))
  }

  const handleDelete = async (key: ApiKey) => {
    if (!token || !projectId) return
    const confirmed = window.confirm(
      `Delete “${key.keyName}” permanently? This cannot be undone.`,
    )
    if (!confirmed) return

    setBusyKeyId(key.id)
    setActionError(null)
    const [, err] = await ApiKeyService.remove(token, projectId, key.id)
    setBusyKeyId(null)

    if (err) {
      setActionError(err)
      return
    }

    setKeys((prev) => prev.filter((k) => k.id !== key.id))
  }

  const closeReveal = () => setRevealedKey(null)

  return (
    <>
      <WorkspacePage
        title="API Keys"
        description="Issue and rotate credentials for authenticated inference traffic."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Keys are scoped to this project. The full secret is only shown once.
            </p>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="!py-2 !px-3 text-sm"
              disabled={!token || !projectId}
            >
              <HiOutlinePlus className="size-4" aria-hidden />
              Create key
            </Button>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          ) : null}

          {actionError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {actionError}
            </p>
          ) : null}

          {isLoading && keys.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading API keys…
            </p>
          ) : keys.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-6 py-12 text-center dark:border-neutral-600 dark:bg-neutral-900/50">
              <HiOutlineKey
                className="size-8 text-neutral-300 dark:text-neutral-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-accent">No API keys yet</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Create a key to authenticate inference traffic for this project.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="!py-2 !px-3 text-sm"
                disabled={!token || !projectId}
              >
                <HiOutlinePlus className="size-4" aria-hidden />
                Create key
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200/80 text-xs tracking-wide text-neutral-400 uppercase dark:border-neutral-700">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Prefix</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Last used</th>
                      <th className="px-4 py-3 font-medium">Expires</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => {
                      const busy = busyKeyId === key.id
                      const revoked =
                        key.status.trim().toUpperCase() === "REVOKED" ||
                        key.status.trim().toUpperCase() === "DISABLED"

                      return (
                        <tr
                          key={key.id}
                          className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                        >
                          <td className="px-4 py-3 font-medium text-accent">
                            {key.keyName}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                            {key.keyPrefix}
                            …
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                                statusClass(key.status),
                              ].join(" ")}
                            >
                              {formatStatus(key.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                            {formatDate(key.lastUsed)}
                          </td>
                          <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                            {formatDate(key.expiresAt)}
                          </td>
                          <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                            {formatDate(key.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {!revoked ? (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void handleRevoke(key)}
                                  className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                  Revoke
                                </button>
                              ) : null}
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleDelete(key)}
                                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                Delete
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
        </div>
      </WorkspacePage>

      <CreateApiKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <RevealApiKeyModal
        open={Boolean(revealedKey)}
        apiKey={revealedKey?.apiKey ?? null}
        keyName={revealedKey?.keyName}
        onClose={closeReveal}
      />
    </>
  )
}

export default ApiKeys
