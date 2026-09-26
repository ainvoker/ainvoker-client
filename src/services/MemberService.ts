import Service, { type ApiErrorInfo } from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type WorkspaceRole = "owner" | "admin" | "member";
export type InviteRole = "admin" | "member";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export type MemberUser = {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
};

export type MemberListItem = {
    id: string;
    role: WorkspaceRole;
    createdAt: string;
    user: MemberUser;
};

export type InviteDelivery = {
    channel: "email" | "manual";
    status: "sent" | "returned";
};

export type InviteItem = {
    id: string;
    email: string;
    role: InviteRole;
    status: InviteStatus;
    expiresAt: string;
    createdAt: string;
    invitedBy: MemberUser;
    /** Dev-only fallback when the API is allowed to return the link. */
    acceptUrl?: string;
    delivery?: InviteDelivery;
};

export type InvitePreview = {
    organizationName: string;
    role: InviteRole;
    email: string;
    expiresAt: string;
    status: InviteStatus;
};

export type AcceptInviteResult = {
    membership: MemberListItem;
    organization: {
        id: string;
        name: string;
        slug: string;
    };
};

export type CreateInviteInput = {
    email: string;
    role: InviteRole;
};

export type UpdateMemberRoleInput = {
    role: WorkspaceRole;
};

class MemberService extends Service {
    async listMembers(
        token: string,
        orgId: string,
    ): Promise<[MemberListItem[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<MemberListItem[]>(
            `${API_URL}/api/v1/organizations/${orgId}/members`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async createInvite(
        token: string,
        orgId: string,
        input: CreateInviteInput,
    ): Promise<[InviteItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<InviteItem>(
            `${API_URL}/api/v1/organizations/${orgId}/invites`,
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

    async listInvites(
        token: string,
        orgId: string,
    ): Promise<[InviteItem[] | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        return this.request<InviteItem[]>(
            `${API_URL}/api/v1/organizations/${orgId}/invites`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async revokeInvite(
        token: string,
        orgId: string,
        inviteId: string,
    ): Promise<[{ deleted: true } | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<{ deleted: true }>(
            `${API_URL}/api/v1/organizations/${orgId}/invites/${inviteId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async resendInvite(
        token: string,
        orgId: string,
        inviteId: string,
    ): Promise<[InviteItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<InviteItem>(
            `${API_URL}/api/v1/organizations/${orgId}/invites/${inviteId}/resend`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async updateMemberRole(
        token: string,
        orgId: string,
        memberId: string,
        input: UpdateMemberRoleInput,
    ): Promise<[MemberListItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<MemberListItem>(
            `${API_URL}/api/v1/organizations/${orgId}/members/${memberId}`,
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

    async removeMember(
        token: string,
        orgId: string,
        memberId: string,
    ): Promise<[{ deleted: true } | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<{ deleted: true }>(
            `${API_URL}/api/v1/organizations/${orgId}/members/${memberId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async transferOwnership(
        token: string,
        orgId: string,
        memberId: string,
    ): Promise<[MemberListItem | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<MemberListItem>(
            `${API_URL}/api/v1/organizations/${orgId}/transfer-ownership`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ memberId }),
            },
        );
    }

    async leave(
        token: string,
        orgId: string,
    ): Promise<[{ deleted: true } | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<{ deleted: true }>(
            `${API_URL}/api/v1/organizations/${orgId}/leave`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async previewInvite(
        token: string | null,
        inviteToken: string,
    ): Promise<[InvitePreview | null, string | undefined]> {
        if (!API_URL) {
            return [null, "VITE_API_URL is not configured"];
        }

        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return this.request<InvitePreview>(
            `${API_URL}/api/v1/invites/preview?token=${encodeURIComponent(inviteToken)}`,
            {
                method: "GET",
                headers,
            },
        );
    }

    async acceptInvite(
        token: string,
        inviteToken: string,
    ): Promise<[AcceptInviteResult | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<AcceptInviteResult>(
            `${API_URL}/api/v1/invites/accept`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: inviteToken }),
            },
        );
    }
}

export default new MemberService();
