import {pgTable, serial, text, integer, timestamp, unique} from "drizzle-orm/pg-core";
import {usersTable} from "./users.schema.js";

export const contactsTable = pgTable('contacts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    contactUserId: integer('contact_user_id').notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    alias: text('alias'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniquePair: unique().on(table.userId, table.contactUserId),
}))