import {pgTable, serial, text, timestamp, pgEnum, integer, boolean, AnyPgColumn} from "drizzle-orm/pg-core";
import {messagesTable} from "./messages.schema.js";

export const chatTypeEnum = pgEnum('chat_type', ['direct', 'group']);

export const chatsTable = pgTable('chats', {
    id: serial('id').primaryKey(),
    type: chatTypeEnum('type').notNull(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastMessageId: integer('last_message_id')
        .references((): AnyPgColumn => messagesTable.id, {onDelete: 'set null'}),
    isSelfChat: boolean('is_self_chat').notNull().default(false),
})