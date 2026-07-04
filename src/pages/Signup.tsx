import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IoArrowBackOutline } from 'react-icons/io5'
import { FaCheck } from "react-icons/fa6";
import { Link } from 'react-router-dom'

import { signupSchema, type SignupFormValues } from '../types/common/signupSchema'
import OAuthProviders from '../components/common/OAuthProviders'
import InputGroup from '../components/common/InputGroup'
import AuthService from '../services/AuthService'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'

const Signup = () => {
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false)
    const { refresh, setAuth } = useAuth()
    const { register, handleSubmit, formState, setError, reset } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        mode: "onTouched"
    })
    const { errors, isDirty, isValid, isSubmitting, isSubmitSuccessful } = formState

    const onSubmit: SubmitHandler<SignupFormValues> = async ({ name, email, password }) => {
        const [data, err] = await AuthService.signup({ name, email, password })

        if (!data && err) {
            setError('email', {
                type: "server",
                message: err.startsWith("User already exists.") ? "User already exists." : err,
            })

            return
        }

        setAuth(data?.user)
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
            refresh()
        }
    }, [isSubmitSuccessful, reset])

    return (
        <div className="w-full min-h-screen flex justify-center md:justify-start bg-white">
            <div className="w-96 flex flex-col gap-3 mx-12 my-4">
                <Link to='/' className="mb-4 text-gray-500 text-sm cursor-pointer flex items-center hover:underline w-fit">
                    <IoArrowBackOutline className="mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-left pb-4 text-gray-800">Create your account</h1>

                <OAuthProviders />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-white">OR</span>
                    </div>
                </div>

                <form className='flex flex-col gap-3' onSubmit={handleSubmit(onSubmit)}>
                    <InputGroup
                        type='text'
                        label='Name'
                        placeholder='Enter your name'
                        error={errors.name?.message}
                        {...register("name")}
                    />
                    <InputGroup
                        type='email'
                        label='Email'
                        placeholder='Enter your email'
                        error={errors.email?.message}
                        {...register("email")}
                    />
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

                    <label className='text-xs flex gap-2 items-center'>
                        <input
                            className='peer'
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            hidden
                        />
                        <div className='border w-3.5 aspect-square rounded-sm border-gray-300 flex justify-center items-center cursor-pointer peer-checked:bg-accent'>
                            {acceptedTerms && <FaCheck color='#fff' size={8} />}
                        </div>
                        <p>
                            I agree to the{" "}
                            <Link to="/terms" className='font-semibold hover:underline'>Terms of Service</Link> and{" "}
                            <Link to="/privacy" className='font-semibold hover:underline'>Privacy Policy</Link>.
                        </p>
                    </label>

                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={!isDirty || !isValid || !acceptedTerms}
                    >
                        Sign up
                    </Button>
                </form>
                <p className='text-xs text-center py-2'>
                    Already have an account?{" "}
                    <Link to="/login" className='font-semibold hover:underline'>Sign in</Link>
                </p>
            </div>
            <div className="flex-1 min-h-screen bg-accent-gradient hidden md:block"></div>
        </div>
    )
}

export default Signup