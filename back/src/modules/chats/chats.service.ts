import {CreateChat, UpdateChat} from "../../types/chats/chats.type.js";
import {canAddToGroup, canMessage, canSeeLastSeen, canSeeReadReceipts} from "../privacy/privacy.service.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {getIo} from "../../socket/ioInstance.js";
import {getStatus} from "../../socket/onlineState.js";
import * as chatsRepository from './chats.repository.js'
import * as messageRepository from '../messages/messages.repository.js'

async function withOtherUserStatus<T extends {otherUser: {id: number | null, lastSeenAt: Date | null, lastReadMessageId: number | null} | null}>(chat: T, viewerId: number) {
    if (!chat.otherUser || chat.otherUser.id == null) return chat
    const otherId = chat.otherUser.id

    const [seeLastSeen, seeReadReceipts] = await Promise.all([
        canSeeLastSeen(viewerId, otherId),
        canSeeReadReceipts(otherId),
    ])

    return {
        ...chat,
        otherUser: {
            ...chat.otherUser,
            id: otherId,
            status: seeLastSeen ? getStatus(otherId) : null,
            lastSeenAt: seeLastSeen ? chat.otherUser.lastSeenAt : null,
            lastReadMessageId: seeReadReceipts ? chat.otherUser.lastReadMessageId : null,
        },
    }
}

async function hydrateChat(chatId: number, viewerId: number) {
    const chat = await chatsRepository.findChatByIdWithOtherUser(chatId, viewerId)
    if (!chat) {
        throw new AppError('Something went wrong', 500)
    }
    return withOtherUserStatus(chat, viewerId)
}

async function notifyChatCreated(chatId: number, creatorId: number, recipientIds: number[]) {
    const io = getIo()

    const roomNames = [creatorId, ...recipientIds].map((id) => `user:${id}`)
    const sockets = await io.to(roomNames).fetchSockets()
    sockets.forEach((s) => s.join(`chat:${chatId}`))

    for (const memberId of recipientIds) {
        const chatForRecipient = await hydrateChat(chatId, memberId)
        io.to(`user:${memberId}`).emit('chat:created', chatForRecipient)
    }
}

async function notifyChatUpdated(chatId: number, exceptUserId: number) {
    const io = getIo()
    const sockets = await io.to(`chat:${chatId}`).except(`user:${exceptUserId}`).fetchSockets()
    for (const s of sockets) {
        const viewerId = s.data.user!.id
        const chatForViewer = await hydrateChat(chatId, viewerId)
        s.emit('chat:updated', chatForViewer)
    }
}

export async function createChat(data: CreateChat, userId: number){
    if (data.memberIds.includes(userId)) {
        throw new AppError('You cannot include yourself in the members list', 400)
    }

    if (data.type === 'direct') {
        const targetId = data.memberIds[0]

        if (!(await canMessage(userId, targetId))) {
            throw new AppError('You do not have permission to message this user', 403)
        }

        const existingChat = await chatsRepository.findDirectChat(userId, targetId)
        if (existingChat) {
            const chat = await hydrateChat(existingChat.chatId, userId)
            return { chat, skippedMemberIds: [] as number[] }
        }

        const createdChat = await chatsRepository.createChatRecord({
            type: data.type, name: data.name, avatarUrl: data.avatarUrl
        })
        if (!createdChat) {
            throw new AppError('Something went wrong', 500)
        }
        await chatsRepository.createRecordsOfChatMembers(createdChat.id, [userId, targetId])
        await notifyChatCreated(createdChat.id, userId, [targetId])

        const chat = await hydrateChat(createdChat.id, userId)
        return { chat, skippedMemberIds: [] as number[] }
    }

    const allowedMemberIds: number[] = []
    const skippedMemberIds: number[] = []

    for (const memberId of data.memberIds) {
        if (await canAddToGroup(userId, memberId)) {
            allowedMemberIds.push(memberId)
        } else {
            skippedMemberIds.push(memberId)
        }
    }

    const createdChat = await chatsRepository.createChatRecord({
        type: data.type, name: data.name, avatarUrl: data.avatarUrl
    })
    if (!createdChat) {
        throw new AppError('Something went wrong', 500)
    }

    if (allowedMemberIds.length > 0) {
        await chatsRepository.createRecordsOfChatMembers(createdChat.id, allowedMemberIds)
    }
    await chatsRepository.createRecordsOfChatAdmins(createdChat.id, [userId])
    await notifyChatCreated(createdChat.id, userId, allowedMemberIds)

    const chat = await hydrateChat(createdChat.id, userId)
    return { chat, skippedMemberIds }
}


export async function getUserChats(userId: number) {
    const chats = await chatsRepository.findChatsByUserId(userId)
    return Promise.all(chats.map((chat) => withOtherUserStatus(chat, userId)))
}

export async function getChatById(chatId: number, userId: number) {
    const chat = await chatsRepository.findChatById(chatId)
    if (!chat) {
        throw new AppError('Chat not found', 404)
    }

    const member = await chatsRepository.findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }

    return hydrateChat(chatId, userId)
}

export async function updateChat(chatId: number, userId: number, data: UpdateChat) {
    if (Object.keys(data).length === 0) {
        throw new AppError('No fields to update', 400)
    }

    const chat = await chatsRepository.findChatById(chatId)
    if (!chat) {
        throw new AppError('Chat not found', 404)
    }
    if (chat.type === 'direct') {
        throw new AppError('Direct chat cannot be updated', 400)
    }

    const member = await chatsRepository.findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }
    if (member.role !== 'admin') {
        throw new AppError('Only admins can update this chat', 403)
    }

    const updatedChat = await chatsRepository.updateChatRecord(chatId, data)
    if (!updatedChat) {
        throw new AppError('Something went wrong', 500)
    }
    await notifyChatUpdated(chatId, userId)
    return hydrateChat(chatId, userId)
}

export async function markChatAsRead(chatId: number, userId: number, messageId: number | undefined) {
    const chat = await chatsRepository.findChatById(chatId)
    if (!chat) {
        throw new AppError('Chat not found', 404)
    }

    const member = await chatsRepository.findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }

    const targetMessageId = messageId ?? chat.lastMessageId
    if (targetMessageId == null) {
        return
    }

    if (messageId != null) {
        const message = await messageRepository.findMessageById(messageId)
        if (!message || message.chatId !== chatId) {
            throw new AppError('Message not found in this chat', 400)
        }
    }

    await chatsRepository.updateLastReadMessageId(chatId, userId, targetMessageId)

    if (await canSeeReadReceipts(userId)) {
        const io = getIo()
        io.to(`chat:${chatId}`).except(`user:${userId}`).emit('chat:read', {chatId, userId, lastReadMessageId: targetMessageId})
    }
}

export async function getOrCreateSavedChat(userId: number) {
    const existing = await chatsRepository.findSavedChat(userId)
    if (existing) {
        return hydrateChat(existing.id, userId)
    }

    const created = await chatsRepository.createChatRecord({type: 'direct', name: null, avatarUrl: null, isSelfChat: true})
    if (!created) {
        throw new AppError('Something went wrong', 500)
    }
    await chatsRepository.createRecordsOfChatMembers(created.id, [userId])

    return hydrateChat(created.id, userId)
}

export async function leaveChat(chatId: number, userId: number) {
    const chat = await chatsRepository.findChatById(chatId)
    if (!chat) {
        throw new AppError('Chat not found', 404)
    }

    const member = await chatsRepository.findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }

    const io = getIo()

    await chatsRepository.deleteChatMember(chatId, userId)

    const remainingMemberIds = await chatsRepository.findChatMemberIds(chatId)
    if (remainingMemberIds.length === 0) {
        await chatsRepository.deleteChatRecord(chatId)
    }

    if (remainingMemberIds.length > 0) {
        if (chat.type === 'group' && member.role === 'admin' && !(await chatsRepository.hasAdminMember(chatId))) {
            const oldestMember = await chatsRepository.findOldestMember(chatId)
            if (oldestMember) {
                await chatsRepository.promoteToAdmin(chatId, oldestMember.userId)
            }
        }
        await notifyChatUpdated(chatId, userId)
    }

    const leavingSockets = await io.to(`user:${userId}`).fetchSockets()
    leavingSockets.forEach((s) => s.leave(`chat:${chatId}`))
}
