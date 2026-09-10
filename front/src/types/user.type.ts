import { z } from 'zod'
import {PALETTE} from "../utils/avatarColor.ts"

export type User = {
    id: number,
    name: string | null,
    username: string,
    email: string,
    phone: string | null,
    description: string | null,
    avatarUrl: string | null,
    avatarColor: string | null,
    lastSeenAt: string | null,
    createdAt: string,
    updatedAt: string,
}

export const updateProfileSchema = z.object({
    username: z.string().min(1, "Required field").optional(),
    name: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
    description: z.string().optional(),
    avatarUrl: z.string().url('Invalid link').optional(),
    avatarColor: z.enum(PALETTE).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

export type SearchedUser = {
    id: number,
    username: string,
    name?: string,
    avatarUrl?: string,
    avatarColor?: string | null,
    similarity: number,
}
export type GetSearchedUsersResponse = {
    users: SearchedUser[]
}