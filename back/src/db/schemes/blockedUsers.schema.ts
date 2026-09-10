import {pgTable, serial, integer, timestamp, unique} from "drizzle-orm/pg-core";
import {usersTable} from "./users.schema.js";

export const blockedUsersTable = pgTable('blocked_users', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    blockedUserId: integer('blocked_user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniquePair: unique().on(table.userId, table.blockedUserId),
}))