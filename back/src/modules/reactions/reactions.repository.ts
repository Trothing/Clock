import {db} from "../../config/db.js";
import {and, eq, inArray} from "drizzle-orm";
import {reactionsTable} from "../../db/schemes/chats/reactions.schema.js";
import {ReactionSummary} from "../../types/chats/reactions.type.js";

export async function getReactionsForMessageIds(messageIds: number[]) {
    const result = new Map<number, ReactionSummary[]>()
    if (messageIds.length === 0) return result

    const rows = await db.select().from(reactionsTable).where(inArray(reactionsTable.messageId, messageIds))

    const byMessage = new Map<number, Map<string, number[]>>()
    for (const row of rows) {
        if (!byMessage.has(row.messageId)) byMessage.set(row.messageId, new Map())
        const byEmoji = byMessage.get(row.messageId)!
        if (!byEmoji.has(row.emoji)) byEmoji.set(row.emoji, [])
        byEmoji.get(row.emoji)!.push(row.userId)
    }

    for (const [messageId, byEmoji] of byMessage) {
        result.set(messageId, Array.from(byEmoji.entries()).map(([emoji, userIds]) => ({
            emoji, count: userIds.length, userIds,
        })))
    }

    return result
}

export async function getReactionsForMessage(messageId: number): Promise<ReactionSummary[]> {
    const map = await getReactionsForMessageIds([messageId])
    return map.get(messageId) ?? []
}

export async function upsertReaction(messageId: number, userId: number, emoji: string) {
    const [row] = await db.insert(reactionsTable)
        .values({messageId, userId, emoji})
        .onConflictDoUpdate({
            target: [reactionsTable.messageId, reactionsTable.userId],
            set: {emoji, createdAt: new Date()},
        })
        .returning()
    return row
}

export async function deleteReaction(messageId: number, userId: number) {
    const [row] = await db.delete(reactionsTable)
        .where(and(eq(reactionsTable.messageId, messageId), eq(reactionsTable.userId, userId)))
        .returning()
    return row
}
