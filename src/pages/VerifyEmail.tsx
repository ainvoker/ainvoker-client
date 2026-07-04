import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import OTPInput from '../components/common/OTPInput'
import Button from '../components/common/Button'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowRoundBack } from "react-icons/io";
import AuthService from '../services/AuthService'

const VerifyEmail = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [resendCountdown, setResendCountdown] = useState<number>(60)
    const [resent, setResent] = useState<boolean>(false)
    const { user, refresh } = useAuth()
    const [otp, setOtp] = useState<string>("")
    const nav = useNavigate()

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
        setResent(true)
        
        await AuthService.resendVerifyEmailOTP({ email: user?.email as string })

        setResendCountdown(60)
        setResent(false)
    }

    useEffect(() => {
        if (resendCountdown <= 0) return;

        const interval = setInterval(() => {
            setResendCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [resendCountdown])

    return (
        <div className='h-screen flex flex-col justify-center items-center'>
            <div className='flex flex-col items-center'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-gray-700 pb-4'>Verify you email</h1>
                    <p className='text-lg font-lighter text-gray-600'>Please enter the six digit verification code we sent to</p>
                    <p className='text-lg font-bold text-gray-700'>{user?.email}</p>
                </div>

                <form className='' onSubmit={handleSubmit}>
                    <OTPInput
                        value={otp}
                        onChange={setOtp}
                        error={error}
                        setError={setError}
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

                <p className='text-md font-lighter text-gray-600 py-4'>
                    Didn't get the email?
                    <span className='ml-1'>
                        {
                            resendCountdown > 0
                                ? <strong>Resend in {resendCountdown}s</strong>
                                : <strong className='hover:underline cursor-pointer' onClick={handleResend}>{resent ? "Sent" : "Resend"}</strong>
                        }
                    </span>
                </p>
                <div className='flex gap-1 items-center text-md text-gray-700 cursor-pointer hover:underline' onClick={() => nav(-1)}>
                    <IoIosArrowRoundBack size={25} />
                    back
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail