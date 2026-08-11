import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import { useTheme } from "../../contexts/ThemeContext"
import type { CreateOrganizationInput } from "../../services/OrganizationService"
import type { ApiErrorInfo } from "../../services/Service"
import type { OrganizationListItem } from "../../services/OrganizationService"
import { routes } from "../../utils/navigation"

const PLAN_CONTACT_REQUIRED = "PLAN_CONTACT_REQUIRED"

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .max(64)
    .regex(
      /^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    )
    .optional()
    .or(z.literal("")),
})

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>

type CreateWorkspaceModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (
    input: CreateOrganizationInput,
  ) => Promise<[OrganizationListItem | null, ApiErrorInfo | undefined]>
}

const CreateWorkspaceModal = ({
  open,
  onClose,
  onSubmit,
}: CreateWorkspaceModalProps) => {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const [upgrade, setUpgrade] = useState<{
    title: string
    body: string
  } | null>(null)
  const { register, handleSubmit, formState, reset, setError, clearErrors } =
    useForm<CreateWorkspaceFormValues>({
      resolver: zodResolver(createWorkspaceSchema),
      defaultValues: {
        name: "",
        slug: "",
      },
    })

  useEffect(() => {
    if (!open) return
    reset({ name: "", slug: "" })
    setUpgrade(null)
    clearErrors()
  }, [open, reset, clearErrors])

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

  const submit: SubmitHandler<CreateWorkspaceFormValues> = async (values) => {
    setUpgrade(null)
    clearErrors("root")

    const [created, err] = await onSubmit({
      name: values.name,
      plan: "pro",
      ...(values.slug ? { slug: values.slug } : {}),
    })

    if (err) {
      if (err.code === PLAN_CONTACT_REQUIRED) {
        setUpgrade({
          title: "Contact sales for Scale",
          body:
            err.message ??
            "Scale workspaces require contacting sales. Pro checkout is available from Billing.",
        })
        return
      }
      setError("root", { message: err.message })
      return
    }

    onClose()
    if (created?.id) {
      navigate(routes.billingCheckout(created.id))
    }
  }

  const goToBilling = () => {
    onClose()
    navigate(routes.billing)
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
        aria-label="Close create workspace dialog"
        onClick={() => {
          if (!formState.isSubmitting) onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="create-workspace-title"
              className="text-lg font-semibold text-accent"
            >
              {upgrade ? upgrade.title : "Create workspace"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {upgrade
                ? upgrade.body
                : "New workspaces are created on Pro. You'll complete payment on the next step."}
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

        {upgrade ? (
          <div className="flex flex-col gap-3">
            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Not now
              </button>
              <Button
                type="button"
                onClick={goToBilling}
                className="!px-4 !py-2.5 text-sm"
              >
                View billing
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950">
              <label
                htmlFor="workspace-name"
                className="block px-4 pt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Name
              </label>
              <input
                id="workspace-name"
                type="text"
                placeholder="Acme Labs"
                className="w-full bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                {...register("name")}
              />
            </div>
            {formState.errors.name ? (
              <p className="-mt-1 text-xs text-red-500">
                {formState.errors.name.message}
              </p>
            ) : null}

            <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950">
              <label
                htmlFor="workspace-slug"
                className="block px-4 pt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                Slug (optional)
              </label>
              <input
                id="workspace-slug"
                type="text"
                placeholder="acme-labs"
                className="w-full bg-transparent px-4 pb-2 font-mono text-base text-neutral-800 outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                {...register("slug")}
              />
            </div>
            {formState.errors.slug ? (
              <p className="-mt-1 text-xs text-red-500">
                {formState.errors.slug.message}
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Leave blank to generate from the name. Plan: Pro (payment required).
              </p>
            )}

            {formState.errors.root ? (
              <p className="text-sm text-red-500">
                {formState.errors.root.message}
              </p>
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
              <Button
                type="submit"
                loading={formState.isSubmitting}
                className="!px-4 !py-2.5 text-sm"
              >
                Create & pay
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default CreateWorkspaceModal
