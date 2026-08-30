import {pgTable, serial, text, integer, timestamp} from "drizzle-orm/pg-core";
import {usersTable} from "./users.schema.js";

export const jwtTable = pgTable('jwt', {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull(),
    userId: integer('user_id').notNull().references(() => usersTable.id, {
        onDelete: 'cascade'
    }),
    expiresAt: timestamp().notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp().defaultNow().notNull(),
})