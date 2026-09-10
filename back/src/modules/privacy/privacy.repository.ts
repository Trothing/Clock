import {and, eq} from "drizzle-orm";
import {db} from "../../config/db.js";
import {privacySettingsTable} from "../../db/schemes/privacySettings.schema.js";
import {contactsTable} from "../../db/schemes/contacts.schema.js";
import type {UpdatePrivacySettingsInput} from "../../types/privacySettings.type.js";

export async function getPrivacySettings(userId: number) {
    const [row] = await db.select().from(privacySettingsTable)
        .where(eq(privacySettingsTable.userId, userId));
    return row ?? null;
}

export async function upsertPrivacySettings(userId: number, data: UpdatePrivacySettingsInput) {
    const [row] = await db.insert(privacySettingsTable)
        .values({userId, ...data})
        .onConflictDoUpdate({
            target: privacySettingsTable.userId,
            set: {...data, updatedAt: new Date()},
        })
        .returning();
    return row;
}

export async function isInContacts(ownerId: number, contactId: number): Promise<boolean> {
    const [row] = await db.select().from(contactsTable)
        .where(and(eq(contactsTable.userId, ownerId), eq(contactsTable.contactUserId, contactId)));
    return !!row;
}