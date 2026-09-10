import {AppError} from "../../shared/middleware/errorHandler.js";
import {UpdateChatSettingsInput} from "../../types/chats/chatSettings.type.js";
import {findChatById, findChatMember} from "../chats/chats.repository.js";
import * as chatSettingsRepository from './chatSettings.repository.js'

export async function updateChatSettings(chatId: number, userId: number, data: UpdateChatSettingsInput) {
    if (Object.keys(data).length === 0) {
        throw new AppError('No fields to update', 400)
    }

    const chat = await findChatById(chatId)
    if (!chat) {
        throw new AppError('Chat not found', 404)
    }

    const member = await findChatMember(chatId, userId)
    if (!member) {
        throw new AppError('You are not a member of this chat', 403)
    }

    const updated = await chatSettingsRepository.upsertChatSettings(chatId, userId, data)
    if (!updated) {
        throw new AppError('Something went wrong', 500)
    }

    return {
        isMuted: updated.isMuted,
        isPinned: updated.isPinned,
        isArchived: updated.isArchived,
    }
}
