import { authClient } from "../utils/auth";
import type { AuthAccount } from "../utils/accountSecurity";
import Service from "./Service";

export type AuthSessionRow = {
    id: string
    token: string
    userId: string
    expiresAt: Date | string
    createdAt: Date | string
    updatedAt: Date | string
    ipAddress?: string | null
    userAgent?: string | null
}

class AuthService extends Service {
    async signup({ name, email, password }: { name: string, email: string, password: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.signUp.email({ name, email, password })

            if (error) {
                throw error
            }

            return data
        })
    }

    async signin({ email, password }: { email: string, password: string }) {
        return this.handle((async () => {
            const { data, error } = await authClient.signIn.email({ email, password })

            if (error) {
                throw error
            }

            return data
        }))
    }

    async signout() {
        await authClient.signOut()
    }

    async getAuthUser() {
        return this.handle(async () => {
            const { data, error } = await authClient.getSession()

            if (error) {
                throw error
            }

            return data
        })
    }

    async verifyEmail({ email, otp }: { email: string, otp: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.emailOtp.verifyEmail({ email, otp })

            if (error) {
                throw error
            }

            return data
        })
    }

    async resendVerifyEmailOTP({ email }: { email: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.sendVerificationEmail({ email })

            if (error) {
                throw error
            }

            return data
        })
    }

    async requestResetPassword({ email }: { email: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.emailOtp.requestPasswordReset({ email })

            if (error) {
                throw error
            }

            return data
        })
    }

    async verifyResetPassword({ email, otp }: { email: string, otp: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.emailOtp.checkVerificationOtp({
                email,
                type: "forget-password",
                otp
            })

            if (error) {
                throw error
            }

            return data
        })
    }

    async resendVerifyResetPasswordOTP({ email }: { email: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.sendVerificationEmail({ email })

            if (error) {
                throw error
            }

            return data
        })
    }

    async resetPassword({ email, otp, password }: { email: string, otp: string, password: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.emailOtp.resetPassword({ email, otp, password })

            if (error) {
                throw error
            }

            return data
        })
    }

    async signinWithProvider({ provider }: { provider: "google" | "github" }) {
        return this.handle(async () => {
            await authClient.signIn.social({
                provider,
                callbackURL: window.location.origin,
                newUserCallbackURL: "/",
                errorCallbackURL: "/",
            })
        })
    }

    async listAccounts() {
        return this.handle(async () => {
            const { data, error } = await authClient.listAccounts()

            if (error) {
                throw error
            }

            return (data ?? []) as AuthAccount[]
        })
    }

    async linkSocial({
        provider,
        callbackURL,
        errorCallbackURL,
    }: {
        provider: "google" | "github"
        callbackURL: string
        errorCallbackURL?: string
    }) {
        return this.handle(async () => {
            const { data, error } = await authClient.linkSocial({
                provider,
                callbackURL,
                errorCallbackURL: errorCallbackURL ?? callbackURL,
            })

            if (error) {
                throw error
            }

            return data
        })
    }

    async unlinkAccount({
        providerId,
        accountId,
    }: {
        providerId: string
        accountId?: string
    }) {
        return this.handle(async () => {
            const { data, error } = await authClient.unlinkAccount({
                providerId,
                ...(accountId ? { accountId } : {}),
            })

            if (error) {
                throw error
            }

            return data
        })
    }

    async changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
    }: {
        currentPassword: string
        newPassword: string
        revokeOtherSessions?: boolean
    }) {
        return this.handle(async () => {
            const { data, error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions,
            })

            if (error) {
                throw error
            }

            return data
        })
    }

    async listSessions() {
        return this.handle(async () => {
            const { data, error } = await authClient.listSessions()

            if (error) {
                throw error
            }

            return (data ?? []) as AuthSessionRow[]
        })
    }

    async revokeSession({ token }: { token: string }) {
        return this.handle(async () => {
            const { data, error } = await authClient.revokeSession({ token })

            if (error) {
                throw error
            }

            return data
        })
    }

    async revokeOtherSessions() {
        return this.handle(async () => {
            const { data, error } = await authClient.revokeOtherSessions()

            if (error) {
                throw error
            }

            return data
        })
    }

    async deleteUser({
        password,
        callbackURL,
    }: {
        password?: string
        callbackURL?: string
    } = {}) {
        return this.handle(async () => {
            const { data, error } = await authClient.deleteUser({
                ...(password ? { password } : {}),
                ...(callbackURL ? { callbackURL } : {}),
            })

            if (error) {
                throw error
            }

            return data
        })
    }
}

export default new AuthService()
