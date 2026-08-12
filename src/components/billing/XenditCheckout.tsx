import { useCallback, useLayoutEffect, useRef, useState } from "react"
import {
  XenditComponents,
  XenditComponentsTest,
  type XenditFatalErrorEvent,
} from "xendit-components-web"

type XenditCheckoutProps = {
  componentsSdkKey: string
  resume?: boolean
  onSuccess: () => void
  onFail: (message: string) => void
}

const useMock =
  import.meta.env.VITE_XENDIT_USE_MOCK === "true" ||
  import.meta.env.DEV && import.meta.env.VITE_XENDIT_USE_MOCK !== "false"

const XenditCheckout = ({
  componentsSdkKey,
  resume = false,
  onSuccess,
  onFail,
}: XenditCheckoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<XenditComponents | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useLayoutEffect(() => {
    const sdk = useMock
      ? new XenditComponentsTest({})
      : new XenditComponents({
          componentsSdkKey,
          resume,
        })
    sdkRef.current = sdk

    const channelPicker = sdk.createChannelPickerComponent()
    containerRef.current?.replaceChildren(channelPicker)

    const handleInit = () => setLoading(false)
    const handleReady = () => setReady(true)
    const handleNotReady = () => setReady(false)
    const handleBegin = () => setSubmitting(true)
    const handleResume = () => setSubmitting(true)
    const handleEnd = (event: { userErrorMessage?: string[] }) => {
      setSubmitting(false)
      if (event.userErrorMessage?.length) {
        onFail(event.userErrorMessage.join("\n"))
      }
    }
    const handleComplete = () => onSuccess()
    const handleFatal = (event: XenditFatalErrorEvent) => onFail(event.message)

    sdk.addEventListener("init", handleInit)
    sdk.addEventListener("submission-ready", handleReady)
    sdk.addEventListener("submission-not-ready", handleNotReady)
    sdk.addEventListener("submission-begin", handleBegin)
    sdk.addEventListener("submission-resume", handleResume)
    sdk.addEventListener("submission-end", handleEnd)
    sdk.addEventListener("session-complete", handleComplete)
    sdk.addEventListener("fatal-error", handleFatal)

    return () => {
      sdk.removeEventListener("init", handleInit)
      sdk.removeEventListener("submission-ready", handleReady)
      sdk.removeEventListener("submission-not-ready", handleNotReady)
      sdk.removeEventListener("submission-begin", handleBegin)
      sdk.removeEventListener("submission-resume", handleResume)
      sdk.removeEventListener("submission-end", handleEnd)
      sdk.removeEventListener("session-complete", handleComplete)
      sdk.removeEventListener("fatal-error", handleFatal)
      sdk.destroyComponent(channelPicker)
      sdkRef.current = null
    }
  }, [componentsSdkKey, resume, onSuccess, onFail])

  const submit = useCallback(() => {
    sdkRef.current?.submit()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="min-h-55 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"
      />
      {!loading ? (
        <button
          type="button"
          onClick={submit}
          disabled={!ready || submitting}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {submitting ? "Processing…" : "Pay now"}
        </button>
      ) : (
        <p className="text-sm text-neutral-500">Loading payment methods…</p>
      )}
    </div>
  )
}

export default XenditCheckout
