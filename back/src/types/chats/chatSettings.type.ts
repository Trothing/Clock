import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {chatSettingsTable} from "../../db/schemes/chats/chatSettings.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";

export const updateChatSettingsSchema = createInsertSchema(chatSettingsTable)
    .omit({chatId: true, userId: true, updatedAt: true})
    .partial()

export type UpdateChatSettingsInput = z.infer<typeof updateChatSettingsSchema>

export type NewChatSettingsDB = InferInsertModel<typeof chatSettingsTable>
export type ChatSettingsDB = InferSelectModel<typeof chatSettingsTable>
