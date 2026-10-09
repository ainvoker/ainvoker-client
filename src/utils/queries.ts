import { queryOptions } from "@tanstack/react-query"
import AiRequestService, {
  type AiRequestStatus,
} from "../services/AiRequestService"
import ApiKeyService from "../services/ApiKeyService"
import ProjectModelService from "../services/ProjectModelService"
import UsageService, { type AnalyticsRange } from "../services/UsageService"

export const LOGS_PAGE_SIZE = 50

/** Service calls resolve to `[data, error]`; React Query expects a throw on failure. */
async function unwrap<T>(
  call: Promise<[T | null, string | undefined]>,
  fallback: string,
): Promise<T> {
  const [data, err] = await call
  if (err || data == null) throw new Error(err ?? fallback)
  return data
}

/** Everything under `["project", projectId]` can be invalidated in one call. */
export const queryKeys = {
  organizations: ["organization"] as const,
  organizationUsage: (organizationId: string) =>
    [...queryKeys.organizations, organizationId, "usage"] as const,
  project: (projectId: string) => ["project", projectId] as const,
  projectUsage: (projectId: string) =>
    [...queryKeys.project(projectId), "usage"] as const,
  projectAnalytics: (projectId: string, range: AnalyticsRange) =>
    [...queryKeys.project(projectId), "analytics", range] as const,
  projectLogsAll: (projectId: string) =>
    [...queryKeys.project(projectId), "logs"] as const,
  projectLogs: (
    projectId: string,
    status: AiRequestStatus | undefined,
    offset: number,
  ) => [...queryKeys.projectLogsAll(projectId), { status, offset }] as const,
  projectLogDetail: (projectId: string, requestId: string) =>
    [...queryKeys.project(projectId), "log", requestId] as const,
  projectModels: (projectId: string) =>
    [...queryKeys.project(projectId), "models"] as const,
  projectApiKeys: (projectId: string) =>
    [...queryKeys.project(projectId), "api-keys"] as const,
}

export const organizationUsageQuery = (token: string, organizationId: string) =>
  queryOptions({
    queryKey: queryKeys.organizationUsage(organizationId),
    queryFn: () =>
      unwrap(
        UsageService.getOrganizationUsage(token, organizationId),
        "Failed to load dashboard",
      ),
  })

export const projectUsageQuery = (token: string, projectId: string) =>
  queryOptions({
    queryKey: queryKeys.projectUsage(projectId),
    queryFn: () =>
      unwrap(
        UsageService.getProjectUsage(token, projectId),
        "Failed to load overview",
      ),
  })

export const projectAnalyticsQuery = (
  token: string,
  projectId: string,
  range: AnalyticsRange,
) =>
  queryOptions({
    queryKey: queryKeys.projectAnalytics(projectId, range),
    queryFn: () =>
      unwrap(
        UsageService.getProjectAnalytics(token, projectId, range),
        "Failed to load analytics",
      ),
  })

export const projectLogsQuery = (
  token: string,
  projectId: string,
  status: AiRequestStatus | undefined,
  offset: number,
) =>
  queryOptions({
    queryKey: queryKeys.projectLogs(projectId, status, offset),
    queryFn: () =>
      unwrap(
        AiRequestService.list(token, projectId, {
          status,
          limit: LOGS_PAGE_SIZE,
          offset,
        }),
        "Failed to load logs",
      ),
  })

export const projectLogDetailQuery = (
  token: string,
  projectId: string,
  requestId: string,
) =>
  queryOptions({
    queryKey: queryKeys.projectLogDetail(projectId, requestId),
    queryFn: () =>
      unwrap(
        AiRequestService.get(token, projectId, requestId),
        "Failed to load request detail",
      ),
  })

export const projectModelsQuery = (token: string, projectId: string) =>
  queryOptions({
    queryKey: queryKeys.projectModels(projectId),
    queryFn: () =>
      unwrap(ProjectModelService.list(token, projectId), "Failed to load models"),
  })

export const projectApiKeysQuery = (token: string, projectId: string) =>
  queryOptions({
    queryKey: queryKeys.projectApiKeys(projectId),
    queryFn: () =>
      unwrap(ApiKeyService.list(token, projectId), "Failed to load API keys"),
  })
