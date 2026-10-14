import { useEffect, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import ApiKeyCapabilitiesField from "./ApiKeyCapabilitiesField"
import { useTheme } from "../../contexts/ThemeContext"
import type { ApiKey, UpdateApiKeyInput } from "../../services/ApiKeyService"
import {
  featuresFromPermissions,
  permissionsFromFeatures,
} from "../../utils/apiKeyCapabilities"

type EditApiKeyModalProps = {
  /** Remount per key (`key={apiKey?.id}`) so the selection starts from that key. */
  apiKey: ApiKey | null
  onClose: () => void
  onSubmit: (
    key: ApiKey,
    input: UpdateApiKeyInput,
  ) => Promise<[unknown, string | undefined]>
}

const EditApiKeyModal = ({ apiKey, onClose, onSubmit }: EditApiKeyModalProps) => {
  const { resolvedTheme } = useTheme()
  const [features, setFeatures] = useState<string[]>(() =>
    apiKey ? featuresFromPermissions(apiKey.permissions) : [],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!apiKey) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [apiKey, onClose, submitting])

  if (!apiKey) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (features.length === 0) return

    setSubmitting(true)
    setError(null)
    const [, err] = await onSubmit(apiKey, {
      permissions: permissionsFromFeatures(features),
    })
    setSubmitting(false)

    if (err) {
      setError(err)
      return
    }

    onClose()
  }

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 text-accent sm:items-center dark:bg-black/60",
        resolvedTheme === "dark" ? "dark" : "",
      ].join(" ")}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close edit API key dialog"
        onClick={() => {
          if (!submitting) onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-api-key-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="edit-api-key-title" className="text-lg font-semibold text-accent">
              Edit permissions
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Changes apply to “{apiKey.keyName}” on its next request. Expiry cannot be changed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent disabled:opacity-50 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <ApiKeyCapabilitiesField value={features} onChange={setFeatures} disabled={submitting} />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {features.length === 0 ? "Select at least one permission." : null}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={features.length === 0}
                loading={submitting}
                className="!py-2.5 !px-4 text-sm"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default EditApiKeyModal
