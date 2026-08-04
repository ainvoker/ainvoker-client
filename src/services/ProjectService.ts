import Service from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type ProjectEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "DISABLED";

export type AppProject = {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    environment: ProjectEnvironment | string;
    status: ProjectStatus | string;
    createdAt: string;
    updatedAt: string;
};

export type CreateProjectInput = {
    name: string;
    description?: string;
    environment: ProjectEnvironment;
};

class ProjectService extends Service {
    async list(
        token: string,
        orgId: string,
    ): Promise<[AppProject[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AppProject[]>(
            `${API_URL}/api/v1/organizations/${orgId}/projects`,
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
        orgId: string,
        input: CreateProjectInput,
    ): Promise<[AppProject | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AppProject>(
            `${API_URL}/api/v1/organizations/${orgId}/projects`,
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

    async get(
        token: string,
        projectId: string,
    ): Promise<[AppProject | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<AppProject>(`${API_URL}/api/v1/projects/${projectId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }
}

export default new ProjectService();
