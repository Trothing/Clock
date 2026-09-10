import {pgTable, serial, text, integer, timestamp} from "drizzle-orm/pg-core";
import {messagesTable} from "./messages.schema.js";

export const attachmentsTable = pgTable('attachments', {
    id: serial('id').primaryKey(),
    messageId: integer('message_id').notNull().references(() => messagesTable.id, {onDelete: 'cascade'}),
    url: text('url').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    duration: integer('duration'),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})