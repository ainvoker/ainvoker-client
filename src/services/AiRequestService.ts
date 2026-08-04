import Service from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type AiRequestStatus = "PENDING" | "SUCCESS" | "FAILED" | "REJECTED";

export type AiRequestSummary = {
    id: string;
    projectId: string;
    apiKeyId: string;
    apiKeyName: string;
    apiKeyPrefix: string;
    model: string;
    serviceType: string;
    requestStatus: string;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    latency: number | null;
    requestCost: string | null;
    createdAt: string;
};

export type AiRequestList = {
    items: AiRequestSummary[];
    total: number;
    limit: number;
    offset: number;
};

export type AiRequestDetail = AiRequestSummary & {
    requestPayload: unknown | null;
    responsePayload: unknown | null;
};

export type ListAiRequestsInput = {
    status?: AiRequestStatus;
    limit?: number;
    offset?: number;
};

class AiRequestService extends Service {
    async list(
        token: string,
        projectId: string,
        input: ListAiRequestsInput = {},
    ): Promise<[AiRequestList | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        const params = new URLSearchParams();
        if (input.status) params.set("status", input.status);
        if (input.limit != null) params.set("limit", String(input.limit));
        if (input.offset != null) params.set("offset", String(input.offset));

        const query = params.toString();
        const url = `${API_URL}/api/v1/projects/${projectId}/ai-requests${query ? `?${query}` : ""}`;

        return this.request<AiRequestList>(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async get(
        token: string,
        projectId: string,
        requestId: string,
    ): Promise<[AiRequestDetail | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AiRequestDetail>(
            `${API_URL}/api/v1/projects/${projectId}/ai-requests/${requestId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export default new AiRequestService();
