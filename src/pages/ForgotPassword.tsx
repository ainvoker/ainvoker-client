
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import InputGroup from "../components/common/InputGroup"
import { z } from "zod";
import AuthService from "../services/AuthService";
import Button from "../components/common/Button";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address")
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const { setAuth } = useAuth()
    const { register, handleSubmit, formState, setError, reset } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onTouched"
    })
    const { errors, isDirty, isValid, isSubmitting, isSubmitSuccessful } = formState
    const nav = useNavigate()

    const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async ({ email }) => {
        const [, err] = await AuthService.requestResetPassword({ email })

        if (err) {
            setError('email', {
                type: 'server',
                message: err
            })
            return
        }

        setAuth({
            id: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            email: email,
            emailVerified: false,
            name: "",
        })

        nav("/verify-reset-password")
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
    }, [isSubmitSuccessful, reset])

    return (
        <div className='h-screen flex flex-col justify-center items-center'>
            <div className='flex flex-col gap-4 items-center w-100'>
                <div className='text-center'>
                    <h1 className='text-4xl font-bold text-gray-700 pb-4'>Forgot Password?</h1>
                    <p className='text-lg font-lighter text-gray-600'>Don't worry! Please enter address associated. We'll send you reset instructions.</p>
                </div>

                <form className='w-full flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup
                        type='email'
                        label='Email'
                        placeholder='Enter your email'
                        error={errors.email?.message}
                        {...register("email")}
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

export default ForgotPassword