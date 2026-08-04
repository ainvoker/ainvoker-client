import type { AppProject, ProjectEnvironment } from "../services/ProjectService"

export type { AppProject, ProjectEnvironment }

const ENV_LABELS: Record<string, string> = {
  DEVELOPMENT: "Development",
  STAGING: "Staging",
  PRODUCTION: "Production",
}

export const PROJECT_ENVIRONMENTS: ProjectEnvironment[] = [
  "DEVELOPMENT",
  "STAGING",
  "PRODUCTION",
]

export const formatProjectEnvironment = (environment: string): string =>
  ENV_LABELS[environment] ?? environment

export const getProjectById = (
  projects: AppProject[],
  projectId: string,
): AppProject | undefined => projects.find((project) => project.id === projectId)
