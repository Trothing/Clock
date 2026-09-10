import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {blockedUsersTable} from "../db/schemes/blockedUsers.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import type {UserPublic} from "./users.type.js";

export const createBlockedUserSchema = createInsertSchema(blockedUsersTable)
    .omit({id: true, userId: true, createdAt: true})

export type CreateBlockedUserInput = z.infer<typeof createBlockedUserSchema>

export type NewBlockedUserDB = InferInsertModel<typeof blockedUsersTable>
export type BlockedUserDB = InferSelectModel<typeof blockedUsersTable>

export type BlockedUserWithUser = BlockedUserDB & { user: UserPublic }
