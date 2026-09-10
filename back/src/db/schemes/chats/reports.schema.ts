import {pgTable, serial, integer, text, timestamp} from "drizzle-orm/pg-core";
import {usersTable} from "../users.schema.js";
import {chatsTable} from "./chats.schema.js";

export const reportsTable = pgTable('reports', {
    id: serial('id').primaryKey(),
    reporterId: integer('reporter_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    chatId: integer('chat_id').notNull().references(() => chatsTable.id, {onDelete: 'cascade'}),
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})
