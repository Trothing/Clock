import {db} from "../../config/db.js";
import {and, eq, or} from "drizzle-orm";
import {blockedUsersTable} from "../../db/schemes/blockedUsers.schema.js";
import {usersTable} from "../../db/schemes/users.schema.js";

export async function findBlockedUsersByUserId(userId: number) {
    return db.select({
        id: blockedUsersTable.id,
        createdAt: blockedUsersTable.createdAt,
        user: {
            id: usersTable.id,
            username: usersTable.username,
            name: usersTable.name,
            avatarUrl: usersTable.avatarUrl,
            avatarColor: usersTable.avatarColor,
        },
    })
        .from(blockedUsersTable)
        .innerJoin(usersTable, eq(usersTable.id, blockedUsersTable.blockedUserId))
        .where(eq(blockedUsersTable.userId, userId))
}

export async function findBlock(userId: number, blockedUserId: number) {
    const [row] = await db.select().from(blockedUsersTable)
        .where(and(eq(blockedUsersTable.userId, userId), eq(blockedUsersTable.blockedUserId, blockedUserId)))
    return row ?? null
}

export async function isBlockedEitherWay(userId1: number, userId2: number) {
    const [row] = await db.select().from(blockedUsersTable)
        .where(or(
            and(eq(blockedUsersTable.userId, userId1), eq(blockedUsersTable.blockedUserId, userId2)),
            and(eq(blockedUsersTable.userId, userId2), eq(blockedUsersTable.blockedUserId, userId1)),
        ))
    return !!row
}

export async function createBlock(userId: number, blockedUserId: number) {
    const [row] = await db.insert(blockedUsersTable).values({userId, blockedUserId}).returning()
    return row
}

export async function deleteBlock(userId: number, blockedUserId: number) {
    const [row] = await db.delete(blockedUsersTable)
        .where(and(eq(blockedUsersTable.userId, userId), eq(blockedUsersTable.blockedUserId, blockedUserId)))
        .returning()
    return row
}
