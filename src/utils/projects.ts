import type {
  AppProject,
  ProjectEnvironment,
  ProjectStatus,
} from "../services/ProjectService"

export type { AppProject, ProjectEnvironment, ProjectStatus }

const ENV_LABELS: Record<string, string> = {
  DEVELOPMENT: "Development",
  STAGING: "Staging",
  PRODUCTION: "Production",
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archived",
  DISABLED: "Disabled",
}

export const PROJECT_ENVIRONMENTS: ProjectEnvironment[] = [
  "DEVELOPMENT",
  "STAGING",
  "PRODUCTION",
]

export const formatProjectEnvironment = (environment: string): string =>
  ENV_LABELS[environment] ?? environment

export const formatProjectStatus = (status: string): string =>
  STATUS_LABELS[status] ?? status

export const isProjectInactive = (status: string): boolean =>
  status !== "ACTIVE"

export const projectStatusBadgeClass = (status: string): string => {
  const normalized = status.trim().toUpperCase()
  if (normalized === "DISABLED") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
  }
  if (normalized === "ARCHIVED") {
    return "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
  }
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
}

export const getProjectById = (
  projects: AppProject[],
  projectId: string,
): AppProject | undefined => projects.find((project) => project.id === projectId)
