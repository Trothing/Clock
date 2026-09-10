import z from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {usersTable} from "../db/schemes/users.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import {AVATAR_PALETTE} from "../utils/avatarPalette.js";

export const createUserSchema = createInsertSchema(usersTable, {
    username: (schema) => schema.trim().min(3).max(32).regex(/^[a-zA-Z0-9_.]+$/, 'Invalid username'),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/).nullable().optional(),
})
    .omit({passwordHash: true, createdAt: true, updatedAt: true, id: true, avatarUrl: true, avatarColor: true, lastSeenAt: true})
    .extend({
        password: z.string().min(8),
    })
export const updateUserSchema = createInsertSchema(usersTable, {
    avatarColor: z.enum(AVATAR_PALETTE),
    avatarUrl: (schema) => schema.url(),
})
    .omit({passwordHash: true, createdAt: true, updatedAt: true, id: true, lastSeenAt: true}).partial()

export const loginUserSchema = z.object({
    identifier: z.string(),
    password: z.string().min(8),
})
export const searchUsersByUsernameSchema = z.object({
    search: z.string().min(1),
    limit: z.number().int().positive().max(100).default(20),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>

export type NewUserDB = InferInsertModel<typeof usersTable>
export type UserDB = InferSelectModel<typeof usersTable>

export type UserPublic = Omit<UserDB, 'passwordHash'>