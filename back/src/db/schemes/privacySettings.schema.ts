import {pgTable, integer, timestamp, pgEnum, boolean} from "drizzle-orm/pg-core";
import {usersTable} from "./users.schema.js";

export const privacyLevelEnum = pgEnum('privacy_level', ['everyone', 'contacts', 'nobody']);

export const privacySettingsTable = pgTable('privacy_settings', {
    userId: integer('user_id').primaryKey().references(() => usersTable.id, {onDelete: 'cascade'}),
    whoCanAddToGroups: privacyLevelEnum('who_can_add_to_groups').default('everyone').notNull(),
    whoCanMessage: privacyLevelEnum('who_can_message').default('everyone').notNull(),
    whoCanSeeLastSeen: privacyLevelEnum('who_can_see_last_seen').default('everyone').notNull(),
    whoCanSeePhone: privacyLevelEnum('who_can_see_phone').default('contacts').notNull(),
    readReceiptsEnabled: boolean('read_receipts_enabled').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})