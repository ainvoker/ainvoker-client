import { z } from "zod";

export const signupSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters"),
        email: z
            .string()
            .trim()
            .email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password cannot exceed 100 characters")
            .regex(/[A-Z]/, "Password must contain an uppercase letter")
            .regex(/[a-z]/, "Password must contain a lowercase letter")
            .regex(/[0-9]/, "Password must contain a number"),
        confirmPassword: z.string()
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Password do not match",
        path: ['confirmPassword']
    })

export type SignupFormValues = z.infer<typeof signupSchema>;