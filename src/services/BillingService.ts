import Service, { type ApiErrorInfo } from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type OrgSubscription = {
    planName: string;
    status: string;
    billingMode: string;
    tokenLimit: number;
    requestLimit: number;
    pendingPlanName?: string | null;
};

export type CheckoutSession = {
    componentsSdkKey: string;
    sessionId: string;
    expiresAt: string | null;
};

class BillingService extends Service {
    async getSubscription(
        token: string,
        organizationId: string,
    ): Promise<[OrgSubscription | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<OrgSubscription>(
            `${API_URL}/api/v1/organizations/${organizationId}/subscription`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async createCheckoutSession(
        token: string,
        organizationId: string,
        input: { plan: "pro"; returnUrl?: string },
    ): Promise<[CheckoutSession | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<CheckoutSession>(
            `${API_URL}/api/v1/organizations/${organizationId}/checkout-sessions`,
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
}

export default new BillingService();
