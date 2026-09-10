import {pgTable, serial, text, integer, timestamp, unique} from "drizzle-orm/pg-core";
import {usersTable} from "../users.schema.js";
import {messagesTable} from "./messages.schema.js";

export const reactionsTable = pgTable('reactions', {
    id: serial('id').primaryKey(),
    messageId: integer('message_id').notNull().references(() => messagesTable.id, {onDelete: 'cascade'}),
    userId: integer('user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    oneReactionPerUser: unique().on(table.messageId, table.userId),
}))