import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useMatch, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import type { ApiErrorInfo } from "../services/Service"
import BillingService, {
  type OrgSubscription,
} from "../services/BillingService"
import OrganizationService, {
  type CreateOrganizationInput,
  type OrganizationListItem,
} from "../services/OrganizationService"
import ProjectService, {
  type AppProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "../services/ProjectService"
import { routes } from "../utils/navigation"
import {
  pickDefaultOrganizationId,
  readInitialOrganizationId,
  readStoredOrganizationId,
  writeStoredOrganizationId,
} from "../utils/workspace"

function isSubscriptionActive(subscription: OrgSubscription | null): boolean {
  if (!subscription || subscription.status !== "ACTIVE") return false
  if (!subscription.expiresAt) return true
  const expires = Date.parse(subscription.expiresAt)
  if (Number.isNaN(expires)) return true
  return expires > Date.now()
}

type WorkspaceContextValue = {
  organizations: OrganizationListItem[]
  activeOrganizationId: string | null
  activeOrganization: OrganizationListItem | null
  role: string | null
  projects: AppProject[]
  subscription: OrgSubscription | null
  isLoading: boolean
  isProjectsLoading: boolean
  isSubscriptionLoading: boolean
  canMutateResources: boolean
  error: string | null
  setActiveWorkspace: (organizationId: string) => void
  refresh: () => Promise<void>
  refreshProjects: () => Promise<void>
  refreshSubscription: () => Promise<void>
  createProject: (
    input: CreateProjectInput,
  ) => Promise<[AppProject | null, string | undefined]>
  updateProject: (
    projectId: string,
    input: UpdateProjectInput,
  ) => Promise<[AppProject | null, string | undefined]>
  deleteProject: (
    projectId: string,
  ) => Promise<[true | null, string | undefined]>
  createWorkspace: (
    input: CreateOrganizationInput,
  ) => Promise<[OrganizationListItem | null, ApiErrorInfo | undefined]>
  deleteWorkspace: (
    organizationId: string,
  ) => Promise<[true | null, ApiErrorInfo | undefined]>
  ensureProjectOrganization: (project: AppProject) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  organizations: [],
  activeOrganizationId: null,
  activeOrganization: null,
  role: null,
  projects: [],
  subscription: null,
  isLoading: false,
  isProjectsLoading: false,
  isSubscriptionLoading: false,
  canMutateResources: false,
  error: null,
  setActiveWorkspace: () => {},
  refresh: async () => {},
  refreshProjects: async () => {},
  refreshSubscription: async () => {},
  createProject: async () => [null, "Workspace is not ready"],
  updateProject: async () => [null, "Workspace is not ready"],
  deleteProject: async () => [null, "Workspace is not ready"],
  createWorkspace: async () => [
    null,
    { status: 0, message: "Workspace is not ready" },
  ],
  deleteWorkspace: async () => [
    null,
    { status: 0, message: "Workspace is not ready" },
  ],
  ensureProjectOrganization: () => {},
})

export const useWorkspace = () => useContext(WorkspaceContext)

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { token, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const projectMatch = useMatch({ path: "/projects/:projectId", end: false })

  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([])
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(
    () => (typeof window === "undefined" ? null : readInitialOrganizationId()),
  )
  const [projects, setProjects] = useState<AppProject[]>([])
  const [subscription, setSubscription] = useState<OrgSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectsLoading, setIsProjectsLoading] = useState(false)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeOrganizationIdRef = useRef(activeOrganizationId)
  const hasLoadedRef = useRef(false)
  activeOrganizationIdRef.current = activeOrganizationId

  const resolveActiveId = useCallback((orgs: OrganizationListItem[]) => {
    const stored = readStoredOrganizationId()
    if (stored && orgs.some((org) => org.id === stored)) {
      return stored
    }
    const current = activeOrganizationIdRef.current
    if (current && orgs.some((org) => org.id === current)) {
      return current
    }
    return pickDefaultOrganizationId(orgs)
  }, [])

  const refresh = useCallback(async () => {
    if (!token) {
      hasLoadedRef.current = false
      setOrganizations([])
      setActiveOrganizationId(null)
      setProjects([])
      setSubscription(null)
      setError(null)
      setIsLoading(false)
      return
    }

    if (!hasLoadedRef.current) setIsLoading(true)
    const [data, err] = await OrganizationService.list(token)

    if (err || !data) {
      setError(err ?? "Failed to load workspaces")
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

    hasLoadedRef.current = true
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

  const refreshSubscription = useCallback(async () => {
    if (!token || !activeOrganizationId) {
      setSubscription(null)
      setIsSubscriptionLoading(false)
      return
    }

    setIsSubscriptionLoading(true)
    const [data] = await BillingService.getSubscription(token, activeOrganizationId)
    setSubscription(data)
    setIsSubscriptionLoading(false)
  }, [token, activeOrganizationId])

  const setActiveWorkspace = useCallback(
    (organizationId: string) => {
      if (!organizationId) return
      if (
        organizations.length > 0 &&
        !organizations.some((org) => org.id === organizationId)
      ) {
        return
      }

      writeStoredOrganizationId(organizationId)
      if (organizationId === activeOrganizationId) return

      setActiveOrganizationId(organizationId)

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

  const updateProject = useCallback(
    async (
      projectId: string,
      input: UpdateProjectInput,
    ): Promise<[AppProject | null, string | undefined]> => {
      if (!token) {
        return [null, "Not signed in"]
      }

      const [project, err] = await ProjectService.update(token, projectId, input)
      if (err || !project) {
        return [null, err ?? "Failed to update project"]
      }

      setProjects((prev) =>
        prev.map((item) => (item.id === project.id ? project : item)),
      )

      return [project, undefined]
    },
    [token],
  )

  const deleteProject = useCallback(
    async (projectId: string): Promise<[true | null, string | undefined]> => {
      if (!token) {
        return [null, "Not signed in"]
      }

      const [, err] = await ProjectService.remove(token, projectId)
      if (err) {
        return [null, err]
      }

      setProjects((prev) => prev.filter((item) => item.id !== projectId))
      return [true, undefined]
    },
    [token],
  )

  const createWorkspace = useCallback(
    async (
      input: CreateOrganizationInput,
    ): Promise<[OrganizationListItem | null, ApiErrorInfo | undefined]> => {
      if (!token) {
        return [null, { status: 0, message: "Not signed in" }]
      }

      const [org, err] = await OrganizationService.create(token, input)
      if (err || !org) {
        return [
          null,
          err ?? { status: 0, message: "Failed to create workspace" },
        ]
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

  const deleteWorkspace = useCallback(
    async (
      organizationId: string,
    ): Promise<[true | null, ApiErrorInfo | undefined]> => {
      if (!token) {
        return [null, { status: 0, message: "Not signed in" }]
      }

      const [, err] = await OrganizationService.remove(token, organizationId)
      if (err) {
        return [null, err]
      }

      const remaining = organizations.filter((org) => org.id !== organizationId)
      setOrganizations(remaining)

      const nextId = pickDefaultOrganizationId(remaining)
      setActiveOrganizationId(nextId)
      if (nextId) {
        writeStoredOrganizationId(nextId)
      }

      if (projectMatch) {
        navigate(routes.projects)
      } else {
        navigate(routes.settings)
      }

      return [true, undefined]
    },
    [token, organizations, projectMatch, navigate],
  )

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true)
      return
    }

    if (!token) {
      hasLoadedRef.current = false
      setOrganizations([])
      setActiveOrganizationId(null)
      setProjects([])
      setSubscription(null)
      setError(null)
      setIsLoading(false)
      return
    }

    void refresh()
  }, [authLoading, token, refresh])

  useEffect(() => {
    void refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    void refreshSubscription()
  }, [refreshSubscription])

  const activeOrganization = useMemo(
    () => organizations.find((org) => org.id === activeOrganizationId) ?? null,
    [organizations, activeOrganizationId],
  )

  const canMutateResources = isSubscriptionActive(subscription)

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      organizations,
      activeOrganizationId,
      activeOrganization,
      role: activeOrganization?.role ?? null,
      projects,
      subscription,
      isLoading,
      isProjectsLoading,
      isSubscriptionLoading,
      canMutateResources,
      error,
      setActiveWorkspace,
      refresh,
      refreshProjects,
      refreshSubscription,
      createProject,
      updateProject,
      deleteProject,
      createWorkspace,
      deleteWorkspace,
      ensureProjectOrganization,
    }),
    [
      organizations,
      activeOrganizationId,
      activeOrganization,
      projects,
      subscription,
      isLoading,
      isProjectsLoading,
      isSubscriptionLoading,
      canMutateResources,
      error,
      setActiveWorkspace,
      refresh,
      refreshProjects,
      refreshSubscription,
      createProject,
      updateProject,
      deleteProject,
      createWorkspace,
      deleteWorkspace,
      ensureProjectOrganization,
    ],
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}
