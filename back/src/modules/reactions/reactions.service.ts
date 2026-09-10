import {AppError} from "../../shared/middleware/errorHandler.js";
import {getIo} from "../../socket/ioInstance.js";
import {findChatMember} from "../chats/chats.repository.js";
import {findMessageById} from "../messages/messages.repository.js";
import * as reactionsRepository from './reactions.repository.js'

function notifyReactionsUpdated(chatId: number, messageId: number, reactions: Awaited<ReturnType<typeof reactionsRepository.getReactionsForMessage>>) {
    const io = getIo()
    io.to(`chat:${chatId}`).emit('message:reactionsUpdated', {chatId, messageId, reactions})
}

async function assertCanReact(chatId: number, messageId: number, userId: number) {
    const message = await findMessageById(messageId)
    if (!message || message.chatId !== chatId || message.deletedAt) {
        throw new AppError('Message not found', 404)
    }

    const member = await findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }
}

export async function addReaction(chatId: number, messageId: number, userId: number, emoji: string) {
    await assertCanReact(chatId, messageId, userId)

    await reactionsRepository.upsertReaction(messageId, userId, emoji)

    const reactions = await reactionsRepository.getReactionsForMessage(messageId)
    notifyReactionsUpdated(chatId, messageId, reactions)
    return reactions
}

export async function removeReaction(chatId: number, messageId: number, userId: number) {
    await assertCanReact(chatId, messageId, userId)

    await reactionsRepository.deleteReaction(messageId, userId)

    const reactions = await reactionsRepository.getReactionsForMessage(messageId)
    notifyReactionsUpdated(chatId, messageId, reactions)
    return reactions
}
