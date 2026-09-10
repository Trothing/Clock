import {pgTable, serial, text, integer, timestamp, pgEnum, AnyPgColumn} from "drizzle-orm/pg-core";
import {usersTable} from "../users.schema.js";
import {chatsTable} from "./chats.schema.js";

export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'file', 'system']);

export const messagesTable = pgTable('messages', {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').notNull().references(() => chatsTable.id, {onDelete: 'cascade'}),
    senderId: integer('sender_id').references(() => usersTable.id, {onDelete: 'set null'}),
    replyToMessageId: integer('reply_to_message_id')
        .references((): AnyPgColumn => messagesTable.id, {onDelete: 'set null'}),
    type: messageTypeEnum('type').default('text').notNull(),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    editedAt: timestamp('edited_at'),
    deletedAt: timestamp('deleted_at'),
    pinnedAt: timestamp('pinned_at'),
    forwardedFromSenderId: integer('forwarded_from_sender_id').references(() => usersTable.id, {onDelete: 'set null'}),
    forwardedFromSenderName: text('forwarded_from_sender_name'),
})