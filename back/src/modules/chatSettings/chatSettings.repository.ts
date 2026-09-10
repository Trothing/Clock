import {db} from "../../config/db.js";
import {and, eq} from "drizzle-orm";
import {chatSettingsTable} from "../../db/schemes/chats/chatSettings.schema.js";
import {UpdateChatSettingsInput} from "../../types/chats/chatSettings.type.js";

export async function findChatSettings(chatId: number, userId: number) {
    const [row] = await db.select().from(chatSettingsTable)
        .where(and(eq(chatSettingsTable.chatId, chatId), eq(chatSettingsTable.userId, userId)))
    return row ?? null
}

export async function upsertChatSettings(chatId: number, userId: number, data: UpdateChatSettingsInput) {
    const [row] = await db.insert(chatSettingsTable)
        .values({chatId, userId, ...data})
        .onConflictDoUpdate({
            target: [chatSettingsTable.chatId, chatSettingsTable.userId],
            set: {...data, updatedAt: new Date()},
        })
        .returning()
    return row
}
