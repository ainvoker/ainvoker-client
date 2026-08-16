import Service, { type ApiErrorInfo } from "./Service";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type PaymentMethodSnapshot = {
    type: string | null;
    brand: string | null;
    last4: string | null;
    hasToken: boolean;
};

export type OrgSubscription = {
    planName: string;
    status: string;
    billingMode: string;
    tokenLimit: number;
    requestLimit: number;
    pendingPlanName?: string | null;
    expiresAt?: string | null;
    renewsAt?: string | null;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string | null;
    paymentMethod?: PaymentMethodSnapshot | null;
};

export type CheckoutSession = {
    componentsSdkKey: string;
    sessionId: string;
    expiresAt: string | null;
};

export type InvoiceItem = {
    id: string;
    date: string;
    description: string;
    status: "issued" | "paid" | "failed" | "refunded";
    amount: string;
    currency: string;
    receiptUrl: string | null;
    referenceNumber: string;
};

export type CancelSubscriptionResult = {
    cancelAtPeriodEnd: boolean;
    expiresAt: string | null;
    alreadyCanceled?: boolean;
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

    async listInvoices(
        token: string,
        organizationId: string,
    ): Promise<[InvoiceItem[] | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<InvoiceItem[]>(
            `${API_URL}/api/v1/organizations/${organizationId}/invoices`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    }

    async cancelSubscription(
        token: string,
        organizationId: string,
    ): Promise<[CancelSubscriptionResult | null, ApiErrorInfo | undefined]> {
        if (!API_URL) {
            return [null, { status: 0, message: "VITE_API_URL is not configured" }];
        }

        return this.requestDetailed<CancelSubscriptionResult>(
            `${API_URL}/api/v1/organizations/${organizationId}/subscription/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
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
