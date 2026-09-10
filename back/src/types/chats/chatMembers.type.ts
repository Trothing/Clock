import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {chatMembersTable} from "../../db/schemes/chats/chatMembers.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import type {UserPublic} from "../users.type.js";

export const addChatMemberSchema = createInsertSchema(chatMembersTable)
    .pick({userId: true})

export const updateChatMemberRoleSchema = createInsertSchema(chatMembersTable)
    .pick({role: true})

export const updateLastReadSchema = z.object({
    messageId: z.number().int().positive(),
})

export type AddChatMemberInput = z.infer<typeof addChatMemberSchema>
export type UpdateChatMemberRoleInput = z.infer<typeof updateChatMemberRoleSchema>
export type UpdateLastReadInput = z.infer<typeof updateLastReadSchema>

export type NewChatMemberDB = InferInsertModel<typeof chatMembersTable>
export type ChatMemberDB = InferSelectModel<typeof chatMembersTable>

export type ChatMemberWithUser = ChatMemberDB & { user: UserPublic }
