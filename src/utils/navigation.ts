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
  HiOutlinePaintBrush,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice2,
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
  settings: "/settings",
  settingsGeneral: "/settings/general",
  settingsTeam: "/settings/team",
  settingsBilling: "/settings/billing",
  settingsBillingCheckout: (orgId: string, plan: "pro" = "pro") =>
    `/settings/billing/checkout?orgId=${encodeURIComponent(orgId)}&plan=${plan}`,
  settingsProfile: "/settings/profile",
  settingsAppearance: "/settings/appearance",
  inviteAccept: "/invites/accept",
  /** @deprecated Use settingsBilling — kept as alias for redirects */
  billing: "/settings/billing",
  billingCheckout: (orgId: string, plan: "pro" = "pro") =>
    `/settings/billing/checkout?orgId=${encodeURIComponent(orgId)}&plan=${plan}`,
  /** @deprecated Use settingsTeam */
  team: "/settings/team",
  docs: "/docs",
  terms: "/terms",
  privacy: "/privacy",
} as const

export const workspaceNav: NavLinkItem[] = [
  { label: "Dashboard", path: routes.dashboard, icon: HiOutlineHome, end: true },
  { label: "Projects", path: routes.projects, icon: HiOutlineFolder, end: true },
  { label: "Settings", path: routes.settings, icon: HiOutlineCog6Tooth },
]

export type SettingsNavItem = {
  label: string
  path: string
  icon: IconType
  end?: boolean
}

export type SettingsNavGroup = {
  label: string
  items: SettingsNavItem[]
}

export const settingsNavGroups: SettingsNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "General",
        path: routes.settingsGeneral,
        icon: HiOutlineBuildingOffice2,
        end: true,
      },
      { label: "Team", path: routes.settingsTeam, icon: HiOutlineUsers },
      {
        label: "Billing",
        path: routes.settingsBilling,
        icon: HiOutlineCreditCard,
        end: true,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", path: routes.settingsProfile, icon: HiOutlineUserCircle },
      {
        label: "Appearance",
        path: routes.settingsAppearance,
        icon: HiOutlinePaintBrush,
      },
    ],
  },
]

export const settingsSectionLabels: Record<string, string> = {
  general: "General",
  team: "Team",
  billing: "Billing",
  profile: "Profile",
  appearance: "Appearance",
}

export const getProjectNav = (projectId: string): NavLinkItem[] => [
  {
    label: "Overview",
    path: routes.projectOverview(projectId),
    icon: HiOutlineSquares2X2,
    end: true,
  },
  { label: "API Keys", path: routes.projectApiKeys(projectId), icon: HiOutlineKey },
  { label: "Models", path: routes.projectModels(projectId), icon: HiOutlineCube },
  { label: "Actions", path: routes.projectActions(projectId), icon: HiOutlineBolt },
  {
    label: "Analytics",
    path: routes.projectAnalytics(projectId),
    icon: HiOutlineChartBar,
  },
  { label: "Logs", path: routes.projectLogs(projectId), icon: HiOutlineDocumentText },
  {
    label: "Settings",
    path: routes.projectSettings(projectId),
    icon: HiOutlineCog6Tooth,
  },
]
