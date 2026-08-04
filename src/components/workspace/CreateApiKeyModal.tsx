import { useEffect } from "react"
import { createPortal } from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import { useTheme } from "../../contexts/ThemeContext"
import type { CreateApiKeyInput } from "../../services/ApiKeyService"

const createApiKeySchema = z.object({
  keyName: z.string().trim().min(1, "Name is required").max(100),
  expiresAt: z.string().optional().or(z.literal("")),
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
      defaultValues: {
        keyName: "",
        expiresAt: "",
      },
    })

  useEffect(() => {
    if (!open) return
    reset({ keyName: "", expiresAt: "" })
  }, [open, reset])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !formState.isSubmitting) {
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

  const submit: SubmitHandler<CreateApiKeyFormValues> = async (values) => {
    const input: CreateApiKeyInput = {
      keyName: values.keyName,
    }

    if (values.expiresAt) {
      const date = new Date(values.expiresAt)
      if (Number.isNaN(date.getTime())) {
        setError("expiresAt", { message: "Enter a valid date" })
        return
      }
      input.expiresAt = date.toISOString()
    }

    const [, err] = await onSubmit(input)

    if (err) {
      setError("root", { message: err })
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
        aria-label="Close create API key dialog"
        onClick={() => {
          if (!formState.isSubmitting) onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-api-key-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="create-api-key-title"
              className="text-lg font-semibold text-accent"
            >
              Create API key
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              The secret is shown only once after creation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={formState.isSubmitting}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent disabled:opacity-50 dark:hover:bg-neutral-800"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950">
            <label
              htmlFor="api-key-name"
              className="block px-4 pt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="api-key-name"
              type="text"
              placeholder="Production server"
              className="w-full bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
              {...register("keyName")}
            />
          </div>
          {formState.errors.keyName ? (
            <p className="-mt-1 text-xs text-red-500">
              {formState.errors.keyName.message}
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950">
            <label
              htmlFor="api-key-expires"
              className="block px-4 pt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Expires (optional)
            </label>
            <input
              id="api-key-expires"
              type="datetime-local"
              className="w-full bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none dark:text-neutral-100"
              {...register("expiresAt")}
            />
          </div>
          {formState.errors.expiresAt ? (
            <p className="-mt-1 text-xs text-red-500">
              {formState.errors.expiresAt.message}
            </p>
          ) : null}

          {formState.errors.root ? (
            <p className="text-sm text-red-500">{formState.errors.root.message}</p>
          ) : null}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={formState.isSubmitting}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <Button type="submit" loading={formState.isSubmitting} className="!py-2.5 !px-4 text-sm">
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default CreateApiKeyModal
