import {Request, Response} from "express";
import {updateChatSettingsSchema} from "../../types/chats/chatSettings.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import * as chatSettingsService from "./chatSettings.service.js"
import {parseRouteId} from "../../utils/parseRouteId.js";

function parseChatId(rawId: string | string[]) {
    return parseRouteId(rawId, 'chat id')
}

export async function updateChatSettings(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)

    const result = updateChatSettingsSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const settings = await chatSettingsService.updateChatSettings(chatId, req.user!.id, result.data)
    res.status(200).json({settings})
}
