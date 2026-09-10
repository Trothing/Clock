import {db} from "../../config/db.js";
import {and, desc, eq, inArray, isNull, like, not, or} from "drizzle-orm";
import {attachmentsTable} from "../../db/schemes/chats/attachments.schema.js";
import {messagesTable} from "../../db/schemes/chats/messages.schema.js";
import type {AttachmentPublic, NewAttachmentDB} from "../../types/chats/attachments.type.js";

export type AttachmentCategory = 'media' | 'files' | 'voice'

export async function createAttachment(data: Omit<NewAttachmentDB, 'id' | 'createdAt'>) {
    const [row] = await db.insert(attachmentsTable).values(data).returning()
    return row
}

export async function getAttachmentsForMessageIds(messageIds: number[]) {
    const result = new Map<number, AttachmentPublic[]>()
    if (messageIds.length === 0) return result

    const rows = await db.select().from(attachmentsTable).where(inArray(attachmentsTable.messageId, messageIds))

    for (const {messageId, ...attachment} of rows) {
        if (!result.has(messageId)) result.set(messageId, [])
        result.get(messageId)!.push(attachment)
    }

    return result
}

export async function getAttachmentsForMessage(messageId: number) {
    const map = await getAttachmentsForMessageIds([messageId])
    return map.get(messageId) ?? []
}

export async function getAttachmentsForChat(chatId: number, category: AttachmentCategory) {
    const mimeCondition = category === 'media'
        ? or(like(attachmentsTable.mimeType, 'image/%'), like(attachmentsTable.mimeType, 'video/%'))
        : category === 'voice'
            ? like(attachmentsTable.mimeType, 'audio/%')
            : and(
                not(like(attachmentsTable.mimeType, 'image/%')),
                not(like(attachmentsTable.mimeType, 'video/%')),
                not(like(attachmentsTable.mimeType, 'audio/%')),
            )

    return db.select({
        id: attachmentsTable.id,
        url: attachmentsTable.url,
        mimeType: attachmentsTable.mimeType,
        size: attachmentsTable.size,
        duration: attachmentsTable.duration,
        width: attachmentsTable.width,
        height: attachmentsTable.height,
        createdAt: attachmentsTable.createdAt,
    })
        .from(attachmentsTable)
        .innerJoin(messagesTable, eq(attachmentsTable.messageId, messagesTable.id))
        .where(and(eq(messagesTable.chatId, chatId), isNull(messagesTable.deletedAt), mimeCondition))
        .orderBy(desc(attachmentsTable.createdAt))
}
