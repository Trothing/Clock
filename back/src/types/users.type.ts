import z from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {usersTable} from "../db/schemes/users.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";

// Schemes
export const createUserSchema = createInsertSchema(usersTable, {
    email: z.string().email(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
})
    .omit({passwordHash: true, createdAt: true, updatedAt: true, id: true, avatarUrl: true, lastSeenAt: true})
    .extend({
        password: z.string().min(8),
    })
export const updateUserSchema = createInsertSchema(usersTable)
    .omit({passwordHash: true, createdAt: true, updatedAt: true, id: true, lastSeenAt: true}).partial()

export const loginUserSchema = z.object({
    identifier: z.string(),
    password: z.string().min(8),
})

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>

export type NewUserDB = InferInsertModel<typeof usersTable>
export type UserDB = InferSelectModel<typeof usersTable>

export type UserPublic = Omit<UserDB, 'passwordHash'>