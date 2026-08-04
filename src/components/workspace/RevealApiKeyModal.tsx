import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { HiOutlineClipboardDocument, HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import { useTheme } from "../../contexts/ThemeContext"

type RevealApiKeyModalProps = {
  open: boolean
  apiKey: string | null
  keyName?: string
  onClose: () => void
}

const RevealApiKeyModal = ({
  open,
  apiKey,
  keyName,
  onClose,
}: RevealApiKeyModalProps) => {
  const { resolvedTheme } = useTheme()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setCopied(false)
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open || !apiKey) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
    } catch {
      setCopied(false)
    }
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
        aria-label="Close reveal API key dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reveal-api-key-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="reveal-api-key-title"
              className="text-lg font-semibold text-accent"
            >
              Save your API key
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {keyName ? (
                <>
                  Copy the secret for <span className="font-medium text-accent">{keyName}</span>.
                  It won&apos;t be shown again.
                </>
              ) : (
                <>Copy this secret now. It won&apos;t be shown again.</>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          Store this key somewhere safe. You cannot retrieve the full value later.
        </div>

        <div className="mt-3 flex items-stretch gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-xs break-all text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100">
            {apiKey}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <HiOutlineClipboardDocument className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={onClose} className="!py-2.5 !px-4 text-sm">
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RevealApiKeyModal
