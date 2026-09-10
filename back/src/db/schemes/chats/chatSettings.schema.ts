import {pgTable, integer, boolean, timestamp, primaryKey} from "drizzle-orm/pg-core";
import {usersTable} from "../users.schema.js";
import {chatsTable} from "./chats.schema.js";

export const chatSettingsTable = pgTable('chat_settings', {
    chatId: integer('chat_id').notNull().references(() => chatsTable.id, {onDelete: 'cascade'}),
    userId: integer('user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    isMuted: boolean('is_muted').default(false).notNull(),
    isPinned: boolean('is_pinned').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    pk: primaryKey({columns: [table.chatId, table.userId]}),
}))