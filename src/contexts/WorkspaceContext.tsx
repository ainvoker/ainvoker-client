import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useMatch, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import OrganizationService, {
  type CreateOrganizationInput,
  type OrganizationListItem,
} from "../services/OrganizationService"
import ProjectService, {
  type AppProject,
  type CreateProjectInput,
} from "../services/ProjectService"
import { routes } from "../utils/navigation"
import {
  clearStoredOrganizationId,
  pickDefaultOrganizationId,
  readStoredOrganizationId,
  writeStoredOrganizationId,
} from "../utils/workspace"

type WorkspaceContextValue = {
  organizations: OrganizationListItem[]
  activeOrganizationId: string | null
  activeOrganization: OrganizationListItem | null
  role: string | null
  projects: AppProject[]
  isLoading: boolean
  isProjectsLoading: boolean
  error: string | null
  setActiveWorkspace: (organizationId: string) => void
  refresh: () => Promise<void>
  refreshProjects: () => Promise<void>
  createProject: (
    input: CreateProjectInput,
  ) => Promise<[AppProject | null, string | undefined]>
  createWorkspace: (
    input: CreateOrganizationInput,
  ) => Promise<[OrganizationListItem | null, string | undefined]>
  ensureProjectOrganization: (project: AppProject) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  organizations: [],
  activeOrganizationId: null,
  activeOrganization: null,
  role: null,
  projects: [],
  isLoading: false,
  isProjectsLoading: false,
  error: null,
  setActiveWorkspace: () => {},
  refresh: async () => {},
  refreshProjects: async () => {},
  createProject: async () => [null, "Workspace is not ready"],
  createWorkspace: async () => [null, "Workspace is not ready"],
  ensureProjectOrganization: () => {},
})

export const useWorkspace = () => useContext(WorkspaceContext)

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const projectMatch = useMatch({ path: "/projects/:projectId", end: false })

  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([])
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null)
  const [projects, setProjects] = useState<AppProject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProjectsLoading, setIsProjectsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolveActiveId = useCallback((orgs: OrganizationListItem[]) => {
    const stored = readStoredOrganizationId()
    if (stored && orgs.some((org) => org.id === stored)) {
      return stored
    }
    return pickDefaultOrganizationId(orgs)
  }, [])

  const refresh = useCallback(async () => {
    if (!token) {
      setOrganizations([])
      setActiveOrganizationId(null)
      setProjects([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const [data, err] = await OrganizationService.list(token)

    if (err || !data) {
      setError(err ?? "Failed to load workspaces")
      setOrganizations([])
      setIsLoading(false)
      return
    }

    setOrganizations(data)
    setError(null)

    const nextId = resolveActiveId(data)
    setActiveOrganizationId(nextId)
    if (nextId) {
      writeStoredOrganizationId(nextId)
    }

    setIsLoading(false)
  }, [token, resolveActiveId])

  const refreshProjects = useCallback(async () => {
    if (!token || !activeOrganizationId) {
      setProjects([])
      setIsProjectsLoading(false)
      return
    }

    setIsProjectsLoading(true)
    const [data, err] = await ProjectService.list(token, activeOrganizationId)

    if (err || !data) {
      setError(err ?? "Failed to load projects")
      setProjects([])
      setIsProjectsLoading(false)
      return
    }

    setProjects(data)
    setError(null)
    setIsProjectsLoading(false)
  }, [token, activeOrganizationId])

  const setActiveWorkspace = useCallback(
    (organizationId: string) => {
      if (organizationId === activeOrganizationId) return
      if (!organizations.some((org) => org.id === organizationId)) return

      setActiveOrganizationId(organizationId)
      writeStoredOrganizationId(organizationId)

      if (projectMatch) {
        navigate(routes.projects)
      }
    },
    [activeOrganizationId, organizations, projectMatch, navigate],
  )

  const ensureProjectOrganization = useCallback(
    (project: AppProject) => {
      if (project.organizationId === activeOrganizationId) return
      if (!organizations.some((org) => org.id === project.organizationId)) return

      setActiveOrganizationId(project.organizationId)
      writeStoredOrganizationId(project.organizationId)
    },
    [activeOrganizationId, organizations],
  )

  const createProject = useCallback(
    async (
      input: CreateProjectInput,
    ): Promise<[AppProject | null, string | undefined]> => {
      if (!token || !activeOrganizationId) {
        return [null, "No active workspace"]
      }

      const [project, err] = await ProjectService.create(
        token,
        activeOrganizationId,
        input,
      )

      if (err || !project) {
        return [null, err ?? "Failed to create project"]
      }

      setProjects((prev) => {
        if (prev.some((item) => item.id === project.id)) return prev
        return [...prev, project]
      })

      return [project, undefined]
    },
    [token, activeOrganizationId],
  )

  const createWorkspace = useCallback(
    async (
      input: CreateOrganizationInput,
    ): Promise<[OrganizationListItem | null, string | undefined]> => {
      if (!token) {
        return [null, "Not signed in"]
      }

      const [org, err] = await OrganizationService.create(token, input)
      if (err || !org) {
        return [null, err ?? "Failed to create workspace"]
      }

      setOrganizations((prev) => {
        if (prev.some((item) => item.id === org.id)) return prev
        return [...prev, org]
      })
      setActiveOrganizationId(org.id)
      writeStoredOrganizationId(org.id)

      if (projectMatch) {
        navigate(routes.projects)
      }

      return [org, undefined]
    },
    [token, projectMatch, navigate],
  )

  useEffect(() => {
    if (!token) {
      clearStoredOrganizationId()
      setOrganizations([])
      setActiveOrganizationId(null)
      setProjects([])
      setError(null)
      return
    }

    void refresh()
  }, [token, refresh])

  useEffect(() => {
    void refreshProjects()
  }, [refreshProjects])

  const activeOrganization = useMemo(
    () => organizations.find((org) => org.id === activeOrganizationId) ?? null,
    [organizations, activeOrganizationId],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      organizations,
      activeOrganizationId,
      activeOrganization,
      role: activeOrganization?.role ?? null,
      projects,
      isLoading,
      isProjectsLoading,
      error,
      setActiveWorkspace,
      refresh,
      refreshProjects,
      createProject,
      createWorkspace,
      ensureProjectOrganization,
    }),
    [
      organizations,
      activeOrganizationId,
      activeOrganization,
      projects,
      isLoading,
      isProjectsLoading,
      error,
      setActiveWorkspace,
      refresh,
      refreshProjects,
      createProject,
      createWorkspace,
      ensureProjectOrganization,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}
