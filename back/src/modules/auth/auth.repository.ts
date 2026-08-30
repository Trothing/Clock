import type {NewUserDB} from "../../types/users.type.js";
import {db} from "../../config/db.js";
import {usersTable} from "../../db/schemes/users.schema.js";
import {jwtTable} from "../../db/schemes/jwt.schema.js";
import {and, eq, isNull, or} from "drizzle-orm";

export async function createUser(newUser: NewUserDB) {
    const [ user ] = await db.insert(usersTable).values(newUser).returning()
    return user
}

export async function findUserByIdentifier(identifier: string) {
    const [user] = await db.select().from(usersTable)
        .where(or(eq(usersTable.email, identifier), eq(usersTable.username, identifier)))
    return user
}

export async function findUserByEmailOrUsername(email: string, username: string) {
    const [user] = await db.select().from(usersTable)
        .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
    return user
}

export async function createJwtRecord(tokenHash: string, expiresAt: Date, userId: number){
    const [record] = await db.insert(jwtTable).values({userId, expiresAt, tokenHash}).returning()
    return record
}

export async function findActiveJwtRecordsByUserId(userId: number) {
    return db.select().from(jwtTable)
        .where(and(eq(jwtTable.userId, userId), isNull(jwtTable.revokedAt)))
}

export async function revokeJwtRecord(id: number) {
    const [record] = await db.update(jwtTable)
        .set({revokedAt: new Date()})
        .where(eq(jwtTable.id, id))
        .returning()
    return record
}
