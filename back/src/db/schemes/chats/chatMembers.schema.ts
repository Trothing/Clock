import {pgTable, integer, timestamp, pgEnum, primaryKey} from "drizzle-orm/pg-core";
import {usersTable} from "../users.schema.js";
import {chatsTable} from "./chats.schema.js";
import {messagesTable} from "./messages.schema.js";

export const chatMemberRoleEnum = pgEnum('chat_member_role', ['admin', 'member']);

export const chatMembersTable = pgTable('chat_members', {
    chatId: integer('chat_id').notNull().references(() => chatsTable.id, {onDelete: 'cascade'}),
    userId: integer('user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    role: chatMemberRoleEnum('role').default('member').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    lastReadMessageId: integer('last_read_message_id')
        .references(() => messagesTable.id, {onDelete: 'set null'}),
}, (table) => ({
    pk: primaryKey({columns: [table.chatId, table.userId]}),
}))