import Service from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type ApiKey = {
    id: string;
    projectId: string;
    keyName: string;
    keyPrefix: string;
    permissions: unknown | null;
    lastUsed: string | null;
    expiresAt: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export type CreatedApiKey = ApiKey & {
    apiKey: string;
};

export type CreateApiKeyInput = {
    keyName: string;
    permissions?: unknown | null;
    expiresAt?: string | null;
};

class ApiKeyService extends Service {
    async list(
        token: string,
        projectId: string,
    ): Promise<[ApiKey[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ApiKey[]>(
            `${API_URL}/api/v1/projects/${projectId}/api-keys`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    async create(
        token: string,
        projectId: string,
        input: CreateApiKeyInput,
    ): Promise<[CreatedApiKey | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<CreatedApiKey>(
            `${API_URL}/api/v1/projects/${projectId}/api-keys`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            },
        );
    }

    async revoke(
        token: string,
        projectId: string,
        keyId: string,
    ): Promise<[ApiKey | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ApiKey>(
            `${API_URL}/api/v1/projects/${projectId}/api-keys/${keyId}/revoke`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    async remove(
        token: string,
        projectId: string,
        keyId: string,
    ): Promise<[{ deleted: boolean } | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<{ deleted: boolean }>(
            `${API_URL}/api/v1/projects/${projectId}/api-keys/${keyId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export default new ApiKeyService();
