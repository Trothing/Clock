import {NewMessageDB} from "../../types/chats/messages.type.js";
import {db} from "../../config/db.js";
import {messagesTable} from "../../db/index.js";
import {usersTable} from "../../db/schemes/users.schema.js";
import {alias} from "drizzle-orm/pg-core";
import {and, desc, eq, isNotNull, isNull, lt, sql} from "drizzle-orm";

function enrichedMessageQuery() {
    const sender = alias(usersTable, 'sender')
    const replyToMessage = alias(messagesTable, 'reply_to_message')
    const replyToSender = alias(usersTable, 'reply_to_sender')

    return db.select({
        message: messagesTable,
        sender: {
            id: sender.id,
            username: sender.username,
            name: sender.name,
            avatarUrl: sender.avatarUrl,
            avatarColor: sender.avatarColor,
        },
        replyTo: {
            id: replyToMessage.id,
            type: replyToMessage.type,
            content: replyToMessage.content,
            deletedAt: replyToMessage.deletedAt,
            senderId: replyToSender.id,
            senderUsername: replyToSender.username,
            senderName: replyToSender.name,
        },
    })
        .from(messagesTable)
        .leftJoin(sender, eq(messagesTable.senderId, sender.id))
        .leftJoin(replyToMessage, eq(messagesTable.replyToMessageId, replyToMessage.id))
        .leftJoin(replyToSender, eq(replyToMessage.senderId, replyToSender.id))
}

function mapMessageRow(row: Awaited<ReturnType<typeof enrichedMessageQuery>>[number]) {
    return {
        ...row.message,
        sender: row.sender?.id == null ? null : {
            id: row.sender.id,
            username: row.sender.username!,
            name: row.sender.name,
            avatarUrl: row.sender.avatarUrl,
            avatarColor: row.sender.avatarColor,
        },
        replyTo: row.replyTo.id == null ? null : {
            id: row.replyTo.id,
            type: row.replyTo.type!,
            content: row.replyTo.deletedAt ? null : row.replyTo.content,
            isDeleted: row.replyTo.deletedAt != null,
            sender: row.replyTo.senderId == null ? null : {
                id: row.replyTo.senderId,
                username: row.replyTo.senderUsername!,
                name: row.replyTo.senderName,
            },
        },
    }
}

export async function createMessage(data: NewMessageDB) {
    const [message] = await db.insert(messagesTable).values(data).returning()
    return message
}

export async function getMessagesFromChat(chatId: number, limit: number = 50, beforeMessageId?: number) {
    const conditions = [eq(messagesTable.chatId, chatId)]
    if (beforeMessageId != null) {
        conditions.push(lt(messagesTable.id, beforeMessageId))
    }

    const rows = await enrichedMessageQuery()
        .where(and(...conditions))
        .orderBy(desc(messagesTable.createdAt))
        .limit(limit)

    return rows.map(mapMessageRow)
}

export async function findMessageById(messageId: number) {
    const [row] = await enrichedMessageQuery().where(eq(messagesTable.id, messageId))
    return row ? mapMessageRow(row) : null
}

export async function updateMessageContent(messageId: number, content: string) {
    const [updated] = await db.update(messagesTable)
        .set({content, editedAt: new Date()})
        .where(eq(messagesTable.id, messageId))
        .returning()
    return updated
}

export async function softDeleteMessage(messageId: number) {
    const [deleted] = await db.update(messagesTable)
        .set({content: null, deletedAt: new Date()})
        .where(eq(messagesTable.id, messageId))
        .returning()
    return deleted
}

export async function setPinned(messageId: number, pinned: boolean) {
    const [updated] = await db.update(messagesTable)
        .set({pinnedAt: pinned ? new Date() : null})
        .where(eq(messagesTable.id, messageId))
        .returning()
    return updated
}

export async function getPinnedMessages(chatId: number) {
    const rows = await enrichedMessageQuery()
        .where(and(eq(messagesTable.chatId, chatId), isNotNull(messagesTable.pinnedAt)))
        .orderBy(desc(messagesTable.pinnedAt))

    return rows.map(mapMessageRow)
}

export async function getMessagesWithLinks(chatId: number) {
    const rows = await enrichedMessageQuery()
        .where(and(
            eq(messagesTable.chatId, chatId),
            isNull(messagesTable.deletedAt),
            sql`${messagesTable.content} ~ 'https?://'`,
        ))
        .orderBy(desc(messagesTable.createdAt))

    return rows.map(mapMessageRow)
}
