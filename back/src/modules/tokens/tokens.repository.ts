import {db} from "../../config/db.js";
import {jwtTable} from "../../db/schemes/jwt.schema.js";
import {and, eq, isNotNull, lt} from "drizzle-orm";

export async function createJwtRecord(tokenHash: string, expiresAt: Date, userId: number){
    const [record] = await db.insert(jwtTable).values({userId, expiresAt, tokenHash}).returning()
    return record
}

export async function findJwtRecordsByUserId(userId: number) {
    return await db.select().from(jwtTable).where(eq(jwtTable.userId, userId))
}

export async function deleteRefreshToken(refreshTokenId: number){
    const [deleted] = await db.delete(jwtTable).where(eq(jwtTable.id, refreshTokenId)).returning()
    return deleted
}

export async function markRefreshTokenUsed(refreshTokenId: number){
    const [updated] = await db.update(jwtTable)
        .set({usedAt: new Date()})
        .where(eq(jwtTable.id, refreshTokenId))
        .returning()
    return updated
}

export async function deleteUsedTokensOlderThan(userId: number, cutoff: Date){
    return await db.delete(jwtTable)
        .where(and(eq(jwtTable.userId, userId), isNotNull(jwtTable.usedAt), lt(jwtTable.usedAt, cutoff)))
}
