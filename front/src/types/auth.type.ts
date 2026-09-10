import { z } from 'zod'
import type {User} from "./user.type.ts";

export const registerSchema = z.object({
    username: z.string().min(1, "Required field"),
    name: z.string().optional(),
    email: z.string().email('Invalid email'),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
    description: z.string().optional(),
    password: z.string().min(8, 'Minimum 8 characters'),
})

export const loginSchema = z.object({
    identifier: z.string().min(1, "Required field"),
    password: z.string().min(8, 'Minimum 8 characters'),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>

export type AuthResponse = {
    accessToken: string,
    user: User,
}
