import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import OTPInput from '../components/common/OTPInput'
import Button from '../components/common/Button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IoArrowBackOutline } from "react-icons/io5";
import AuthService from '../services/AuthService'
import AuthLayout from '../layouts/AuthLayout'
import { loginPathWithNext, resolveInviteNext } from '../utils/inviteRedirect'

const VerifyEmail = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [resendCountdown, setResendCountdown] = useState<number>(60)
    const [resent, setResent] = useState<boolean>(false)
    const { user, refresh, setAuth } = useAuth()
    const [otp, setOtp] = useState<string>("")
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const inviteNext = resolveInviteNext(searchParams.get("next"))

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsSubmitting(true)
        const [, err] = await AuthService.verifyEmail({ email: user?.email as string, otp })
        setIsSubmitting(false)

        if (err) {
            setError(err)
            return
        }

        refresh()
    }

    const handleResend = async () => {
        setOtp("")
        setError(null)
        setResent(true)

        await AuthService.resendVerifyEmailOTP({ email: user?.email as string })

        setResendCountdown(60)
        setResent(false)
    }

    const handleBackToSignIn = () => {
        setAuth(undefined)
        navigate(loginPathWithNext(inviteNext), { replace: true })
    }

    useEffect(() => {
        if (resendCountdown <= 0) return;

        const interval = setInterval(() => {
            setResendCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [resendCountdown])

    return (
        <AuthLayout>
            <button
                type="button"
                onClick={handleBackToSignIn}
                className="mb-4 text-gray-500 text-sm cursor-pointer flex items-center hover:underline w-fit"
            >
                <IoArrowBackOutline className="mr-2" />
                Back to Sign in
            </button>
            <h1 className="text-2xl font-bold text-left pb-2 text-gray-800">Verify your email</h1>
            <p className="text-sm text-gray-600 pb-1">
                Enter the six-digit code we sent to
            </p>
            <p className="text-sm font-semibold text-gray-800 pb-2">{user?.email}</p>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    error={error}
                    setError={setError}
                    size="compact"
                />

                <Button
                    type='submit'
                    className='w-full'
                    disabled={otp.length != 6 || isSubmitting || !!error}
                    loading={isSubmitting}
                >
                    Verify
                </Button>
            </form>

            <p className='text-xs text-center py-4 text-gray-600'>
                Didn't get the email?{' '}
                {resendCountdown > 0 ? (
                    <span className="font-semibold">Resend in {resendCountdown}s</span>
                ) : (
                    <button
                        type="button"
                        className="font-semibold hover:underline cursor-pointer"
                        onClick={handleResend}
                    >
                        {resent ? "Sent" : "Resend"}
                    </button>
                )}
            </p>
        </AuthLayout>
    )
}

export default VerifyEmail
