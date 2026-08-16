import Service from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type AllowedOrigin = {
    id: string;
    projectId: string;
    origin: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateAllowedOriginInput = {
    origin: string;
};

class AllowedOriginService extends Service {
    async list(
        token: string,
        projectId: string,
    ): Promise<[AllowedOrigin[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AllowedOrigin[]>(
            `${API_URL}/api/v1/projects/${projectId}/allowed-origins`,
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
        input: CreateAllowedOriginInput,
    ): Promise<[AllowedOrigin | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AllowedOrigin>(
            `${API_URL}/api/v1/projects/${projectId}/allowed-origins`,
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

    async remove(
        token: string,
        projectId: string,
        originId: string,
    ): Promise<[{ deleted: boolean } | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<{ deleted: boolean }>(
            `${API_URL}/api/v1/projects/${projectId}/allowed-origins/${originId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export default new AllowedOriginService();
