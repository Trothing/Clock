import {pgTable, serial, text, integer, timestamp} from "drizzle-orm/pg-core";
import {usersTable} from "./users.schema.js";

export const jwtTable = pgTable('jwt', {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull(),
    userId: integer('user_id').notNull().references(() => usersTable.id, {
        onDelete: 'cascade'
    }),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    usedAt: timestamp('used_at'),
})