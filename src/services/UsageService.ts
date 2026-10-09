import Service from "./Service";
import type { AiRequestSummary } from "./AiRequestService";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type UsagePlanSnapshot = {
    planName: string;
    status: string;
    billingMode: string;
    requestLimit: number;
    tokenLimit: number;
    expiresAt: string | null;
};

export type UsagePeriod = {
    requestsUsed: number;
    tokensUsed: number;
    successfulRequests: number;
    failedRequests: number;
    periodStart: string;
};

export type OrgUsageProject = {
    id: string;
    name: string;
    environment: string;
    status: string;
    requestsUsed: number;
    tokensUsed: number;
};

export type OrgRecentRequest = AiRequestSummary & {
    projectName: string | null;
};

export type OrgUsageByModel = {
    modelId: number;
    model: string;
    requestsUsed: number;
    tokensUsed: number;
    percentOfTokenQuota: number | null;
};

export type UsageDailyPoint = {
    date: string;
    requestsUsed: number;
    tokensUsed: number;
    successfulRequests: number;
    failedRequests: number;
};

export type UsageDailySegmentPoint = {
    date: string;
    id: string;
    name: string;
    requestsUsed: number;
    tokensUsed: number;
};

export type OrganizationUsage = {
    plan: UsagePlanSnapshot | null;
    period: UsagePeriod;
    projects: OrgUsageProject[];
    byModel: OrgUsageByModel[];
    daily: UsageDailyPoint[];
    dailyByProject: UsageDailySegmentPoint[];
    dailyByModel: UsageDailySegmentPoint[];
    recentRequests: OrgRecentRequest[];
};

export type ProjectUsagePeriod = UsagePeriod & {
    avgLatency: number | null;
};

export type ProjectUsage = {
    project: {
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        environment: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    plan: UsagePlanSnapshot | null;
    period: ProjectUsagePeriod;
    organizationPeriod: UsagePeriod;
    keys: {
        total: number;
        active: number;
    };
    byModel: OrgUsageByModel[];
    daily: UsageDailyPoint[];
    organizationDaily: UsageDailyPoint[];
    recentRequests: AiRequestSummary[];
};

export type AnalyticsRange = "billing_month" | "7d" | "30d";

export type ApiKeyUsageRow = {
    apiKeyId: string;
    keyName: string;
    keyPrefix: string;
    requestsUsed: number;
    tokensUsed: number;
};

export type ProjectAnalytics = {
    range: AnalyticsRange;
    project: {
        id: string;
        organizationId: string;
        name: string;
    };
    plan: UsagePlanSnapshot | null;
    period: UsagePeriod & {
        inputTokens: number;
        outputTokens: number;
        /** Decimal string in USD. */
        totalCost: string;
    };
    latency: {
        avg: number | null;
        p50: number | null;
        p95: number | null;
    };
    organizationPeriod: UsagePeriod;
    byModel: OrgUsageByModel[];
    byApiKey: ApiKeyUsageRow[];
    daily: UsageDailyPoint[];
    dailyByModel: UsageDailySegmentPoint[];
    dailyByApiKey: UsageDailySegmentPoint[];
    recentRequests: AiRequestSummary[];
};

class UsageService extends Service {
    async getOrganizationUsage(
        token: string,
        organizationId: string,
    ): Promise<[OrganizationUsage | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<OrganizationUsage>(
            `${API_URL}/api/v1/organizations/${organizationId}/usage`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    async getProjectUsage(
        token: string,
        projectId: string,
    ): Promise<[ProjectUsage | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ProjectUsage>(
            `${API_URL}/api/v1/projects/${projectId}/usage`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    async getProjectAnalytics(
        token: string,
        projectId: string,
        range: AnalyticsRange,
    ): Promise<[ProjectAnalytics | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ProjectAnalytics>(
            `${API_URL}/api/v1/projects/${projectId}/analytics?range=${range}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export default new UsageService();
