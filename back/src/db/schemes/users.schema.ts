import {pgTable, serial, text, timestamp} from "drizzle-orm/pg-core";

export const usersTable = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name'),
    username: text('username').unique().notNull(),
    email: text('email').unique().notNull(),
    phone: text('phone').unique(),
    description: text('description'),
    passwordHash: text('password_hash').notNull(),
    avatarUrl: text('avatar_url'),
    lastSeenAt: timestamp('last_seen_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})