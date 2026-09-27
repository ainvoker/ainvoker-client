import Service from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type ProjectModel = {
    id: number;
    provider: string;
    name: string;
    slug: string;
    contextWindow: number;
    freeEligible: boolean;
    enabled: boolean;
    locked: boolean;
};

export type ToggleProjectModelInput = {
    enabled: boolean;
};

class ProjectModelService extends Service {
    async list(
        token: string,
        projectId: string,
    ): Promise<[ProjectModel[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ProjectModel[]>(
            `${API_URL}/api/v1/projects/${projectId}/models`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }

    async toggle(
        token: string,
        projectId: string,
        modelId: number,
        input: ToggleProjectModelInput,
    ): Promise<[ProjectModel | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<ProjectModel>(
            `${API_URL}/api/v1/projects/${projectId}/models/${modelId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            },
        );
    }
}

export default new ProjectModelService();
