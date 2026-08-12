import type { IconType } from "react-icons"
import {
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineKey,
  HiOutlineBolt,
  HiOutlineFolder,
  HiOutlineUsers,
  HiOutlineSquares2X2,
} from "react-icons/hi2"

export type NavLinkItem = {
  label: string
  path: string
  icon: IconType
  end?: boolean
}

/** Canonical path builders for workspace + project routes */
export const routes = {
  dashboard: "/",
  projects: "/projects",
  project: (projectId: string) => `/projects/${projectId}`,
  projectOverview: (projectId: string) => `/projects/${projectId}`,
  projectApiKeys: (projectId: string) => `/projects/${projectId}/api-keys`,
  projectModels: (projectId: string) => `/projects/${projectId}/models`,
  projectActions: (projectId: string) => `/projects/${projectId}/actions`,
  projectAnalytics: (projectId: string) => `/projects/${projectId}/analytics`,
  projectLogs: (projectId: string) => `/projects/${projectId}/logs`,
  projectSettings: (projectId: string) => `/projects/${projectId}/settings`,
  billing: "/billing",
  billingCheckout: (orgId: string, plan: "pro" = "pro") =>
    `/billing/checkout?orgId=${encodeURIComponent(orgId)}&plan=${plan}`,
  team: "/team",
  settings: "/settings",
} as const

export const workspaceNav: NavLinkItem[] = [
  { label: "Dashboard", path: routes.dashboard, icon: HiOutlineHome, end: true },
  { label: "Projects", path: routes.projects, icon: HiOutlineFolder, end: true },
  { label: "Billing", path: routes.billing, icon: HiOutlineCreditCard },
  { label: "Team", path: routes.team, icon: HiOutlineUsers },
  { label: "Settings", path: routes.settings, icon: HiOutlineCog6Tooth },
]

export const getProjectNav = (projectId: string): NavLinkItem[] => [
  { label: "Overview", path: routes.projectOverview(projectId), icon: HiOutlineSquares2X2, end: true },
  { label: "API Keys", path: routes.projectApiKeys(projectId), icon: HiOutlineKey },
  { label: "Models", path: routes.projectModels(projectId), icon: HiOutlineCube },
  { label: "Actions", path: routes.projectActions(projectId), icon: HiOutlineBolt },
  { label: "Analytics", path: routes.projectAnalytics(projectId), icon: HiOutlineChartBar },
  { label: "Logs", path: routes.projectLogs(projectId), icon: HiOutlineDocumentText },
  { label: "Settings", path: routes.projectSettings(projectId), icon: HiOutlineCog6Tooth },
]
