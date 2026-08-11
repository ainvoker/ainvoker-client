import Service, { type ApiErrorInfo } from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type OrganizationListItem = {
    id: string;
    name: string;
    slug: string;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateOrganizationInput = {
    name: string;
    slug?: string;
    plan: "pro";
};

class OrganizationService extends Service {
    async list(token: string): Promise<[OrganizationListItem[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<OrganizationListItem[]>(`${API_URL}/api/v1/organizations`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async create(
        token: string,
        input: CreateOrganizationInput,
    ): Promise<[OrganizationListItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<OrganizationListItem>(`${API_URL}/api/v1/organizations`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
    }
}

export default new OrganizationService();
