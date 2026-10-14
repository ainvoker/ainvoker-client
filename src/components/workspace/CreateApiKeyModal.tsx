import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import ApiKeyCapabilitiesField from "./ApiKeyCapabilitiesField"
import ExpiryDatePicker from "./ExpiryDatePicker"
import { useTheme } from "../../contexts/ThemeContext"
import type { CreateApiKeyInput } from "../../services/ApiKeyService"
import { expiryDayToIso, permissionsFromFeatures } from "../../utils/apiKeyCapabilities"

const createApiKeySchema = z.object({
  keyName: z.string().trim().min(1, "Name is required").max(100),
})

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>

type CreateApiKeyModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (
    input: CreateApiKeyInput,
  ) => Promise<[unknown, string | undefined]>
}

const CreateApiKeyModal = ({ open, onClose, onSubmit }: CreateApiKeyModalProps) => {
  const { resolvedTheme } = useTheme()
  const { register, handleSubmit, formState, reset, setError } =
    useForm<CreateApiKeyFormValues>({
      resolver: zodResolver(createApiKeySchema),
      defaultValues: { keyName: "" },
    })
  const [features, setFeatures] = useState<string[]>([])
  const [expiryDay, setExpiryDay] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    reset({ keyName: "" })
  }, [open, reset])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !formState.isSubmitting) {
        setFeatures([])
        setExpiryDay(null)
        onClose()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose, formState.isSubmitting])

  if (!open) return null

  const close = () => {
    setFeatures([])
    setExpiryDay(null)
    onClose()
  }

  const submit: SubmitHandler<CreateApiKeyFormValues> = async (values) => {
    const input: CreateApiKeyInput = { keyName: values.keyName }

    const permissions = permissionsFromFeatures(features)
    if (permissions) {
      input.permissions = permissions
    }

    if (expiryDay) {
      input.expiresAt = expiryDayToIso(expiryDay)
    }

    const [, err] = await onSubmit(input)

    if (err) {
      setError("root", { message: err })
      return
    }

    close()
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
        aria-label="Close create API key dialog"
        onClick={() => {
          if (!formState.isSubmitting) close()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-api-key-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="create-api-key-title" className="text-lg font-semibold text-accent">
              Create API key
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              The secret is shown only once after creation.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={formState.isSubmitting}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent disabled:opacity-50 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="api-key-name"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="api-key-name"
              type="text"
              placeholder="Production server"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
              {...register("keyName")}
            />
            {formState.errors.keyName ? (
              <p className="text-xs text-red-500">{formState.errors.keyName.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Permissions
            </p>
            <ApiKeyCapabilitiesField
              value={features}
              onChange={setFeatures}
              disabled={formState.isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Expiry</p>
            <ExpiryDatePicker
              value={expiryDay}
              onChange={setExpiryDay}
              disabled={formState.isSubmitting}
            />
          </div>

          {formState.errors.root ? (
            <p className="text-sm text-red-500">{formState.errors.root.message}</p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {features.length === 0 ? "Select at least one permission." : null}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                disabled={formState.isSubmitting}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={features.length === 0}
                loading={formState.isSubmitting}
                className="!py-2.5 !px-4 text-sm"
              >
                Create
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default CreateApiKeyModal
