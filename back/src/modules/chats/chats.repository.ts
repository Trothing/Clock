import {NewChatDB, UpdateChat} from "../../types/chats/chats.type.js";
import {db} from "../../config/db.js";
import {and, asc, count, eq, gt, ne} from "drizzle-orm";
import {chatsTable} from "../../db/schemes/chats/chats.schema.js";
import {alias} from "drizzle-orm/pg-core";
import {chatMembersTable} from "../../db/schemes/chats/chatMembers.schema.js";
import {messagesTable} from "../../db/schemes/chats/messages.schema.js";
import {usersTable} from "../../db/schemes/users.schema.js";
import {chatSettingsTable} from "../../db/schemes/chats/chatSettings.schema.js";
import {attachmentsTable} from "../../db/schemes/chats/attachments.schema.js";

function defaultSettings(row: {isMuted: boolean | null, isPinned: boolean | null, isArchived: boolean | null} | null) {
    return {
        isMuted: row?.isMuted ?? false,
        isPinned: row?.isPinned ?? false,
        isArchived: row?.isArchived ?? false,
    }
}

export async function createChatRecord(chatData: NewChatDB) {
    const [ createdChat ] = await db.insert(chatsTable).values(chatData).returning()
    return createdChat
}
export async function createRecordsOfChatMembers(chatId: number, membersIds: number[] ){
    const data = membersIds.map((el) => {
        return {
            userId: el,
            role: "member" as const,
            chatId
        }
    })
    return await db.insert(chatMembersTable).values(data).returning()
}
export async function createRecordsOfChatAdmins(chatId: number, membersIds: number[] ) {
    const data = membersIds.map((el) => {
        return {
            userId: el,
            role: "admin" as const,
            chatId
        }
    })
    return await db.insert(chatMembersTable).values(data).returning()
}
export async function findDirectChat(userId1: number, userId2: number) {
    const cm1 = alias(chatMembersTable, "cm1");
    const cm2 = alias(chatMembersTable, "cm2");

    const result = await db
        .select({ chatId: chatsTable.id })
        .from(chatsTable)
        .innerJoin(cm1, and(eq(cm1.chatId, chatsTable.id), eq(cm1.userId, userId1)))
        .innerJoin(cm2, and(eq(cm2.chatId, chatsTable.id), eq(cm2.userId, userId2)))
        .where(eq(chatsTable.type, "direct"))
        .limit(1);

    return result[0] ?? null;
}

export async function findChatsByUserId(userId: number) {
    const otherMember = alias(chatMembersTable, 'other_member')
    const otherUser = alias(usersTable, 'other_user')

    const rows = await db.select({
        chat: chatsTable,
        lastMessage: {
            content: messagesTable.content,
            type: messagesTable.type,
            createdAt: messagesTable.createdAt,
            senderId: messagesTable.senderId,
            deletedAt: messagesTable.deletedAt,
            attachmentMimeType: attachmentsTable.mimeType,
        },
        otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            username: otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            avatarColor: otherUser.avatarColor,
            lastSeenAt: otherUser.lastSeenAt,
            lastReadMessageId: otherMember.lastReadMessageId,
        },
        settings: {
            isMuted: chatSettingsTable.isMuted,
            isPinned: chatSettingsTable.isPinned,
            isArchived: chatSettingsTable.isArchived,
        },
        myLastReadMessageId: chatMembersTable.lastReadMessageId,
    })
        .from(chatMembersTable)
        .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
        .leftJoin(messagesTable, eq(chatsTable.lastMessageId, messagesTable.id))
        .leftJoin(attachmentsTable, eq(attachmentsTable.messageId, messagesTable.id))
        .leftJoin(otherMember, and(
            eq(otherMember.chatId, chatsTable.id),
            ne(otherMember.userId, userId),
            eq(chatsTable.type, 'direct'),
        ))
        .leftJoin(otherUser, eq(otherUser.id, otherMember.userId))
        .leftJoin(chatSettingsTable, and(
            eq(chatSettingsTable.chatId, chatsTable.id),
            eq(chatSettingsTable.userId, userId),
        ))
        .where(eq(chatMembersTable.userId, userId))

    const unreadCounts = await Promise.all(
        rows.map((row) => getUnreadCount(row.chat.id, userId, row.myLastReadMessageId))
    )

    return rows.map((row, i) => ({
        ...row.chat,
        lastMessage: row.lastMessage?.createdAt == null ? null : row.lastMessage,
        otherUser: row.otherUser?.id == null ? null : row.otherUser,
        settings: defaultSettings(row.settings),
        unreadCount: unreadCounts[i],
    }))
}

export async function getUnreadCount(chatId: number, userId: number, afterMessageId: number | null) {
    const conditions = [eq(messagesTable.chatId, chatId), ne(messagesTable.senderId, userId)]
    if (afterMessageId != null) {
        conditions.push(gt(messagesTable.id, afterMessageId))
    }

    const [row] = await db.select({value: count()}).from(messagesTable).where(and(...conditions))
    return Number(row?.value ?? 0)
}

export async function updateLastMessageId(chatId: number, messageId: number) {
    const [updated] = await db.update(chatsTable)
        .set({lastMessageId: messageId})
        .where(eq(chatsTable.id, chatId))
        .returning()
    return updated
}

export async function updateLastReadMessageId(chatId: number, userId: number, messageId: number) {
    const [updated] = await db.update(chatMembersTable)
        .set({lastReadMessageId: messageId})
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.userId, userId)))
        .returning()
    return updated
}

export async function findChatById(chatId: number) {
    const [chat] = await db.select().from(chatsTable).where(eq(chatsTable.id, chatId))
    return chat
}

export async function findChatByIdWithOtherUser(chatId: number, viewerId: number) {
    const otherMember = alias(chatMembersTable, 'other_member')
    const otherUser = alias(usersTable, 'other_user')
    const ownMember = alias(chatMembersTable, 'own_member')

    const [row] = await db.select({
        chat: chatsTable,
        otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            username: otherUser.username,
            avatarUrl: otherUser.avatarUrl,
            avatarColor: otherUser.avatarColor,
            lastSeenAt: otherUser.lastSeenAt,
            lastReadMessageId: otherMember.lastReadMessageId,
        },
        settings: {
            isMuted: chatSettingsTable.isMuted,
            isPinned: chatSettingsTable.isPinned,
            isArchived: chatSettingsTable.isArchived,
        },
        myLastReadMessageId: ownMember.lastReadMessageId,
    })
        .from(chatsTable)
        .leftJoin(otherMember, and(
            eq(otherMember.chatId, chatsTable.id),
            ne(otherMember.userId, viewerId),
            eq(chatsTable.type, 'direct'),
        ))
        .leftJoin(otherUser, eq(otherUser.id, otherMember.userId))
        .leftJoin(chatSettingsTable, and(
            eq(chatSettingsTable.chatId, chatsTable.id),
            eq(chatSettingsTable.userId, viewerId),
        ))
        .leftJoin(ownMember, and(
            eq(ownMember.chatId, chatsTable.id),
            eq(ownMember.userId, viewerId),
        ))
        .where(eq(chatsTable.id, chatId))

    if (!row) return null

    const unreadCount = await getUnreadCount(chatId, viewerId, row.myLastReadMessageId ?? null)

    return {
        ...row.chat,
        otherUser: row.otherUser?.id == null ? null : row.otherUser,
        settings: defaultSettings(row.settings),
        unreadCount,
    }
}

export async function findChatMember(chatId: number, userId: number) {
    const [member] = await db.select().from(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.userId, userId)))
    return member
}

export async function findChatMemberIds(chatId: number) {
    const rows = await db.select({userId: chatMembersTable.userId}).from(chatMembersTable)
        .where(eq(chatMembersTable.chatId, chatId))
    return rows.map((row) => row.userId)
}

export async function hasAdminMember(chatId: number) {
    const [row] = await db.select({userId: chatMembersTable.userId}).from(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.role, 'admin')))
        .limit(1)
    return !!row
}

export async function findOldestMember(chatId: number) {
    const [row] = await db.select().from(chatMembersTable)
        .where(eq(chatMembersTable.chatId, chatId))
        .orderBy(asc(chatMembersTable.joinedAt))
        .limit(1)
    return row
}

export async function promoteToAdmin(chatId: number, userId: number) {
    await db.update(chatMembersTable)
        .set({role: 'admin'})
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.userId, userId)))
}

export async function updateChatRecord(chatId: number, data: UpdateChat) {
    const [updated] = await db.update(chatsTable)
        .set(data)
        .where(eq(chatsTable.id, chatId))
        .returning()
    return updated
}

export async function deleteChatMember(chatId: number, userId: number) {
    const [deleted] = await db.delete(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.userId, userId)))
        .returning()
    return deleted
}

export async function findSavedChat(userId: number) {
    const [row] = await db.select({chat: chatsTable})
        .from(chatMembersTable)
        .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
        .where(and(eq(chatMembersTable.userId, userId), eq(chatsTable.isSelfChat, true)))
        .limit(1)

    return row?.chat ?? null
}

export async function deleteChatRecord(chatId: number) {
    const [deleted] = await db.delete(chatsTable).where(eq(chatsTable.id, chatId)).returning()
    return deleted
}
