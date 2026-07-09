import { authClient } from "../utils/auth";
import Service from "./Service";

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
}

export default new AuthService()