import Service, { type ApiErrorInfo } from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type OrganizationListItem = {
    id: string;
    name: string;
    slug: string;
    status: string;
    role: string;
    /** Present on current API; optional for older cached payloads. */
    isPersonal?: boolean;
    permissions?: {
        canEdit: boolean;
        canDelete: boolean;
    };
    createdAt: string;
    updatedAt: string;
};

export type CreateOrganizationInput = {
    name: string;
    slug?: string;
    plan: "pro";
};

export type UpdateOrganizationInput = {
    name?: string;
    slug?: string;
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

    async get(
        token: string,
        orgId: string,
    ): Promise<[OrganizationListItem | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<OrganizationListItem>(`${API_URL}/api/v1/organizations/${orgId}`, {
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

    async update(
        token: string,
        orgId: string,
        input: UpdateOrganizationInput,
    ): Promise<[OrganizationListItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<OrganizationListItem>(
            `${API_URL}/api/v1/organizations/${orgId}`,
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

    async remove(
        token: string,
        orgId: string,
    ): Promise<[{ deleted: true } | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<{ deleted: true }>(
            `${API_URL}/api/v1/organizations/${orgId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
}

export default new OrganizationService();
