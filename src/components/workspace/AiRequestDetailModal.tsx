import { useEffect } from "react"
import { createPortal } from "react-dom"
import { HiOutlineXMark } from "react-icons/hi2"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  atomOneDark,
  atomOneLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import InlineLoader from "../common/InlineLoader"
import { useTheme } from "../../contexts/ThemeContext"
import type { AiRequestDetail } from "../../services/AiRequestService"

type AiRequestDetailModalProps = {
  open: boolean
  detail: AiRequestDetail | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const formatStatus = (status: string) => {
  const normalized = status.trim().toLowerCase()
  if (!normalized) return "—"
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusClass = (status: string) => {
  const normalized = status.trim().toUpperCase()
  if (normalized === "SUCCESS") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
  }
  if (normalized === "FAILED" || normalized === "REJECTED") {
    return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
  }
  if (normalized === "PENDING") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
  }
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
}

const formatLatency = (ms: number | null) => {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

const formatJson = (value: unknown) => {
  if (value == null) return "—"
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const MetaItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-xs tracking-wide text-neutral-400 uppercase">{label}</dt>
    <dd className="mt-0.5 truncate text-sm text-accent">{children}</dd>
  </div>
)

const PayloadBlock = ({
  title,
  value,
  isDark,
}: {
  title: string
  value: unknown
  isDark: boolean
}) => (
  <section>
    <h3 className="mb-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">
      {title}
    </h3>
    <div className="max-h-56 overflow-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
      <SyntaxHighlighter
        language="json"
        style={isDark ? atomOneDark : atomOneLight}
        customStyle={{
          margin: 0,
          padding: "0.75rem",
          fontSize: "0.75rem",
          lineHeight: "1.5",
          background: isDark ? "#0a0a0a" : "#fafafa",
        }}
        wrapLongLines
      >
        {formatJson(value)}
      </SyntaxHighlighter>
    </div>
  </section>
)

const AiRequestDetailModal = ({
  open,
  detail,
  isLoading,
  error,
  onClose,
}: AiRequestDetailModalProps) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    if (!open) return

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

  if (!open) return null

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-100 flex items-end justify-center bg-black/40 p-4 text-accent sm:items-center dark:bg-black/60",
        isDark ? "dark" : "",
      ].join(" ")}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close request detail dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-request-detail-title"
        className="relative z-10 flex max-h-[min(90vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-700">
          <div className="min-w-0">
            <h2
              id="ai-request-detail-title"
              className="text-lg font-semibold text-accent"
            >
              Request detail
            </h2>
            {detail ? (
              <p className="mt-1 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {detail.id}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading && !detail ? (
            <InlineLoader label="Loading request…" className="py-6" />
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          ) : null}

          {detail ? (
            <div className="flex flex-col gap-5">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MetaItem label="Status">
                  <span
                    className={[
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      statusClass(detail.requestStatus),
                    ].join(" ")}
                  >
                    {formatStatus(detail.requestStatus)}
                  </span>
                </MetaItem>
                <MetaItem label="Model">{detail.model || "—"}</MetaItem>
                <MetaItem label="Service">{detail.serviceType || "—"}</MetaItem>
                <MetaItem label="API key">
                  <span className="font-medium">{detail.apiKeyName}</span>
                  <span className="ml-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {detail.apiKeyPrefix}…
                  </span>
                </MetaItem>
                <MetaItem label="Tokens">
                  {detail.totalTokens != null
                    ? `${detail.totalTokens.toLocaleString()} (${detail.inputTokens ?? "—"} in / ${detail.outputTokens ?? "—"} out)`
                    : "—"}
                </MetaItem>
                <MetaItem label="Latency">{formatLatency(detail.latency)}</MetaItem>
                <MetaItem label="Cost">{detail.requestCost ?? "—"}</MetaItem>
                <MetaItem label="Time">{formatDate(detail.createdAt)}</MetaItem>
              </dl>

              <PayloadBlock
                title="Request payload"
                value={detail.requestPayload}
                isDark={isDark}
              />
              <PayloadBlock
                title="Response payload"
                value={detail.responsePayload}
                isDark={isDark}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default AiRequestDetailModal
