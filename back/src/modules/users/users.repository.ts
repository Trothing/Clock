import type {NewUserDB, UpdateUserInput} from "../../types/users.type.js";
import {db} from "../../config/db.js";
import {usersTable} from "../../db/index.js";
import {and, eq, ne, or, sql} from "drizzle-orm";
import {chatMembersTable} from "../../db/index.js";

export async function createUser(newUser: NewUserDB) {
    const [ user ] = await db.insert(usersTable).values(newUser).returning()
    return user
}

export async function findUserByIdentifier(identifier: string) {
    const [user] = await db.select().from(usersTable)
        .where(or(eq(usersTable.email, identifier), eq(usersTable.username, identifier)))
    return user
}

export async function findUserById(id: number) {
    const [user] = await db.select().from(usersTable)
        .where(eq(usersTable.id, id))
    return user
}

export async function findUserByEmailOrUsername(email: string, username: string) {
    const [user] = await db.select().from(usersTable)
        .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
    return user
}

export async function searchUsersByUsername(search: string, limit: number, authorId: number){
    return db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            avatarUrl: usersTable.avatarUrl,
            avatarColor: usersTable.avatarColor,
            name: usersTable.name,
            similarity: sql<number>`similarity(${usersTable.username}, ${search})`,
        })
        .from(usersTable)
        .where(and(sql`${usersTable.username} % ${search}`, ne(usersTable.id, authorId)))
        .orderBy(sql`similarity(${usersTable.username}, ${search}) DESC`)
        .limit(limit);
}
export async function updateUser(id: number, data: UpdateUserInput) {
    const [user] = await db.update(usersTable)
        .set({...data, updatedAt: new Date()})
        .where(eq(usersTable.id, id))
        .returning()
    return user
}

export async function findConflictingUser(excludeId: number, fields: {username?: string, email?: string, phone?: string | null}) {
    const conditions = []
    if (fields.username) conditions.push(eq(usersTable.username, fields.username))
    if (fields.email) conditions.push(eq(usersTable.email, fields.email))
    if (fields.phone) conditions.push(eq(usersTable.phone, fields.phone))
    if (conditions.length === 0) return null

    const [row] = await db.select().from(usersTable)
        .where(and(ne(usersTable.id, excludeId), or(...conditions)))
    return row ?? null
}

export async function getUsersByChatId(chatId: number) {
    return db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            name: usersTable.name,
            avatarUrl: usersTable.avatarUrl,
            avatarColor: usersTable.avatarColor,
            role: chatMembersTable.role,
        })
        .from(usersTable)
        .innerJoin(chatMembersTable, eq(chatMembersTable.userId, usersTable.id))
        .where(eq(chatMembersTable.chatId, chatId))
}