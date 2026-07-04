import { z } from "zod";

export const signinSchema = z
    .object({
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
            .regex(/[0-9]/, "Password must contain a number")
    })

export type SigninFormValues = z.infer<typeof signinSchema>;