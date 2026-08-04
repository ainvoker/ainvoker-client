import { useEffect } from "react"
import { createPortal } from "react-dom"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { HiOutlineXMark } from "react-icons/hi2"
import Button from "../common/Button"
import {
  formatProjectEnvironment,
  PROJECT_ENVIRONMENTS,
} from "../../utils/projects"
import type { CreateProjectInput, ProjectEnvironment } from "../../services/ProjectService"

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

type CreateProjectModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (
    input: CreateProjectInput,
  ) => Promise<[unknown, string | undefined]>
}

const CreateProjectModal = ({ open, onClose, onSubmit }: CreateProjectModalProps) => {
  const { register, handleSubmit, formState, reset, setError } =
    useForm<CreateProjectFormValues>({
      resolver: zodResolver(createProjectSchema),
      defaultValues: {
        name: "",
        description: "",
        environment: "DEVELOPMENT",
      },
    })

  useEffect(() => {
    if (!open) return
    reset({
      name: "",
      description: "",
      environment: "DEVELOPMENT",
    })
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

  const submit: SubmitHandler<CreateProjectFormValues> = async (values) => {
    const [, err] = await onSubmit({
      name: values.name,
      environment: values.environment as ProjectEnvironment,
      ...(values.description ? { description: values.description } : {}),
    })

    if (err) {
      setError("root", { message: err })
      return
    }

    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close create project dialog"
        onClick={() => {
          if (!formState.isSubmitting) onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="create-project-title"
              className="text-lg font-semibold text-accent"
            >
              Create project
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Projects belong to your current workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={formState.isSubmitting}
            className="grid size-9 place-content-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-accent disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <label
              htmlFor="project-name"
              className="block px-4 pt-2 text-xs font-medium text-neutral-700"
            >
              Name
            </label>
            <input
              id="project-name"
              type="text"
              placeholder="Production API"
              className="w-full bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none"
              {...register("name")}
            />
          </div>
          {formState.errors.name ? (
            <p className="-mt-1 text-xs text-red-500">
              {formState.errors.name.message}
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <label
              htmlFor="project-environment"
              className="block px-4 pt-2 text-xs font-medium text-neutral-700"
            >
              Environment
            </label>
            <select
              id="project-environment"
              className="w-full bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none"
              {...register("environment")}
            >
              {PROJECT_ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>
                  {formatProjectEnvironment(env)}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <label
              htmlFor="project-description"
              className="block px-4 pt-2 text-xs font-medium text-neutral-700"
            >
              Description (optional)
            </label>
            <textarea
              id="project-description"
              rows={3}
              placeholder="What this project is for"
              className="w-full resize-none bg-transparent px-4 pb-2 text-base text-neutral-800 outline-none"
              {...register("description")}
            />
          </div>
          {formState.errors.description ? (
            <p className="-mt-1 text-xs text-red-500">
              {formState.errors.description.message}
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
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
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

export default CreateProjectModal
