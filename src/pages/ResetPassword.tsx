
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import InputGroup from "../components/common/InputGroup"
import { z } from "zod";
import AuthService from "../services/AuthService";
import Button from "../components/common/Button";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ['confirmPassword']
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
    const { user, refresh, otp, setVerificationCode } = useAuth()
    const { register, handleSubmit, formState, setError, reset } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onTouched"
    })
    const { errors, isDirty, isValid, isSubmitting, isSubmitSuccessful } = formState
    const nav = useNavigate()

    const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ password }) => {
        if(!otp) return

        const [, err] = await AuthService.resetPassword({ email: user?.email as string, otp, password })

        if (err) {
            setError('password', {
                type: 'server',
                message: err
            })
            return
        }

        setVerificationCode(null)
        refresh()
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
            refresh()
        }
    }, [isSubmitSuccessful, reset])

    if(!otp) return <Navigate to={'/login'} />

    return (
        <div className='h-screen flex flex-col justify-center items-center'>
            <div className='flex flex-col gap-4 items-center w-100'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-gray-700 pb-4'>Forgot Password?</h1>
                    <p className='text-lg font-lighter text-gray-600'>Don't worry! Please enter address associated. We'll send you reset instructions.</p>
                </div>

                <form className='w-full flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup
                        type='password'
                        label='Password'
                        placeholder='Enter your password'
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <InputGroup
                        type='password'
                        label='Confirm Password'
                        placeholder='Confirm your password'
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                    />

                    <Button
                        type='submit'
                        className='w-full'
                        disabled={!isDirty || !isValid}
                        loading={isSubmitting}
                    >
                        Send
                    </Button>
                </form>

                <div className='flex gap-1 items-center text-md text-gray-700 cursor-pointer hover:underline' onClick={() => nav(-1)}>
                    <IoIosArrowRoundBack size={25} />
                    back
                </div>
            </div>
        </div>
    )
}

export default ResetPassword