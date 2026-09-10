import {db} from "../../config/db.js";
import {and, eq} from "drizzle-orm";
import {contactsTable} from "../../db/schemes/contacts.schema.js";
import {usersTable} from "../../db/schemes/users.schema.js";
import {NewContactDB} from "../../types/contacts.type.js";

export async function findContactsByUserId(userId: number) {
    return db.select({
        id: contactsTable.id,
        alias: contactsTable.alias,
        createdAt: contactsTable.createdAt,
        user: {
            id: usersTable.id,
            username: usersTable.username,
            name: usersTable.name,
            avatarUrl: usersTable.avatarUrl,
            avatarColor: usersTable.avatarColor,
        },
    })
        .from(contactsTable)
        .innerJoin(usersTable, eq(usersTable.id, contactsTable.contactUserId))
        .where(eq(contactsTable.userId, userId))
}

export async function findContact(userId: number, contactUserId: number) {
    const [row] = await db.select().from(contactsTable)
        .where(and(eq(contactsTable.userId, userId), eq(contactsTable.contactUserId, contactUserId)))
    return row ?? null
}

export async function createContact(data: NewContactDB) {
    const [row] = await db.insert(contactsTable).values(data).returning()
    return row
}

export async function deleteContact(userId: number, contactUserId: number) {
    const [row] = await db.delete(contactsTable)
        .where(and(eq(contactsTable.userId, userId), eq(contactsTable.contactUserId, contactUserId)))
        .returning()
    return row
}
