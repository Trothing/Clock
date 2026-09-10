import {CreateMessageInput, MessageWithRelations, UpdateMessageInput} from "../../types/chats/messages.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {getChatById} from "../chats/chats.service.js";
import {getUsersByChatId} from "../users/users.service.js";
import {canMessage} from "../privacy/privacy.service.js";
import * as messageRepository from './messages.repository.js'
import * as reactionsRepository from '../reactions/reactions.repository.js'
import * as attachmentsRepository from '../attachments/attachments.repository.js'
import type {AttachmentCategory} from '../attachments/attachments.repository.js'
import * as chatsRepository from '../chats/chats.repository.js'
import {getIo} from "../../socket/ioInstance.js";
import {resolveVerifiedAttachment} from "../../utils/resolveAttachment.js";

type MessageCore = Omit<MessageWithRelations, 'reactions' | 'attachments'>

async function hydrateMessage(message: MessageCore): Promise<MessageWithRelations> {
    const [reactions, attachments] = await Promise.all([
        reactionsRepository.getReactionsForMessage(message.id),
        attachmentsRepository.getAttachmentsForMessage(message.id),
    ])
    return {...message, reactions, attachments}
}

async function hydrateMessages(messages: MessageCore[]): Promise<MessageWithRelations[]> {
    const [reactionsMap, attachmentsMap] = await Promise.all([
        reactionsRepository.getReactionsForMessageIds(messages.map((m) => m.id)),
        attachmentsRepository.getAttachmentsForMessageIds(messages.map((m) => m.id)),
    ])
    return messages.map((message) => ({
        ...message,
        reactions: reactionsMap.get(message.id) ?? [],
        attachments: attachmentsMap.get(message.id) ?? [],
    }))
}

function notifyChatAboutMessage(message: MessageWithRelations, creatorId: number) {
    const io = getIo()
    io.to(`chat:${message.chatId}`).except(`user:${creatorId}`).emit('message:created', message)
}

function notifyChatAboutMessageUpdate(message: MessageWithRelations, editorId: number) {
    const io = getIo()
    io.to(`chat:${message.chatId}`).except(`user:${editorId}`).emit('message:updated', message)
}

function notifyChatAboutMessageDelete(message: MessageWithRelations, deleterId: number) {
    const io = getIo()
    io.to(`chat:${message.chatId}`).except(`user:${deleterId}`).emit('message:deleted', message)
}

export async function createMessage(newMessage: CreateMessageInput, userId: number) {
    const {attachment, ...messageData} = newMessage
    const chat = await getChatById(messageData.chatId, userId)

    if (chat.type === 'direct') {
        const chatUsers = await getUsersByChatId(chat.id)
        const receiver = chatUsers.find((chatUser) => chatUser.id !== userId)
        if (receiver && !(await canMessage(userId, receiver.id))) {
            throw new AppError('You can\'t send message to this user', 403)
        }
    }

    const verifiedAttachment = attachment ? await resolveVerifiedAttachment(attachment) : null
    if (attachment && !verifiedAttachment) {
        throw new AppError('Invalid attachment', 400)
    }

    if (messageData.replyToMessageId != null) {
        const replyTarget = await messageRepository.findMessageById(messageData.replyToMessageId)
        if (!replyTarget || replyTarget.chatId !== chat.id) {
            throw new AppError('Reply message not found in this chat', 400)
        }
    }

    const created = await messageRepository.createMessage({...messageData, senderId: userId})
    if (!created) {
        throw new AppError('Something went wrong', 500)
    }
    await chatsRepository.updateLastMessageId(chat.id, created.id)

    if (verifiedAttachment) {
        await attachmentsRepository.createAttachment({messageId: created.id, ...verifiedAttachment})
    }

    const found = await messageRepository.findMessageById(created.id)
    if (!found) {
        throw new AppError('Something went wrong', 500)
    }

    const message = await hydrateMessage(found)
    notifyChatAboutMessage(message, userId)
    return message
}

export async function getMessagesFromChat(chatId: number, limit: number | undefined, beforeMessageId: number | undefined, userId: number) {
    const chat = await getChatById(chatId, userId)
    const messages = await messageRepository.getMessagesFromChat(chat.id, limit, beforeMessageId)
    return hydrateMessages(messages)
}

export async function updateMessage(chatId: number, messageId: number, userId: number, data: UpdateMessageInput) {
    const message = await messageRepository.findMessageById(messageId)
    if (!message || message.deletedAt || message.chatId !== chatId) {
        throw new AppError('Message not found', 404)
    }
    if (message.senderId !== userId) {
        throw new AppError('You can only edit your own messages', 403)
    }

    await messageRepository.updateMessageContent(messageId, data.content)

    const found = await messageRepository.findMessageById(messageId)
    if (!found) {
        throw new AppError('Something went wrong', 500)
    }

    const updated = await hydrateMessage(found)
    notifyChatAboutMessageUpdate(updated, userId)
    return updated
}

export async function deleteMessage(chatId: number, messageId: number, userId: number) {
    const message = await messageRepository.findMessageById(messageId)
    if (!message || message.deletedAt || message.chatId !== chatId) {
        throw new AppError('Message not found', 404)
    }
    if (message.senderId !== userId) {
        throw new AppError('You can only delete your own messages', 403)
    }

    await messageRepository.softDeleteMessage(messageId)

    const found = await messageRepository.findMessageById(messageId)
    if (!found) {
        throw new AppError('Something went wrong', 500)
    }

    const deleted = await hydrateMessage(found)
    notifyChatAboutMessageDelete(deleted, userId)
    return deleted
}

export async function setMessagePinned(chatId: number, messageId: number, userId: number, pinned: boolean) {
    await getChatById(chatId, userId)

    const message = await messageRepository.findMessageById(messageId)
    if (!message || message.deletedAt || message.chatId !== chatId) {
        throw new AppError('Message not found', 404)
    }

    await messageRepository.setPinned(messageId, pinned)

    const found = await messageRepository.findMessageById(messageId)
    if (!found) {
        throw new AppError('Something went wrong', 500)
    }

    const updated = await hydrateMessage(found)
    notifyChatAboutMessageUpdate(updated, userId)
    return updated
}

export async function getPinnedMessages(chatId: number, userId: number) {
    await getChatById(chatId, userId)
    const messages = await messageRepository.getPinnedMessages(chatId)
    return hydrateMessages(messages)
}

export async function getMessagesWithLinks(chatId: number, userId: number) {
    await getChatById(chatId, userId)
    const messages = await messageRepository.getMessagesWithLinks(chatId)
    return hydrateMessages(messages)
}

export async function getChatAttachments(chatId: number, userId: number, category: AttachmentCategory) {
    await getChatById(chatId, userId)
    return attachmentsRepository.getAttachmentsForChat(chatId, category)
}
