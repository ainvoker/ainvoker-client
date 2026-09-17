import { z } from "zod"
import { passwordFieldSchema } from "./passwordSchema"

export const signinSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: passwordFieldSchema,
})

export type SigninFormValues = z.infer<typeof signinSchema>
