import {Request, Response} from "express";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {createReactionSchema} from "../../types/chats/reactions.type.js";
import * as reactionsService from "./reactions.service.js"
import {parseRouteId as parseId} from "../../utils/parseRouteId.js";

export async function addReaction(req: Request, res: Response) {
    const chatId = parseId(req.params.chatId, 'chat id')
    const messageId = parseId(req.params.messageId, 'message id')

    const result = createReactionSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const reactions = await reactionsService.addReaction(chatId, messageId, req.user!.id, result.data.emoji)
    res.status(200).json({reactions})
}

export async function removeReaction(req: Request, res: Response) {
    const chatId = parseId(req.params.chatId, 'chat id')
    const messageId = parseId(req.params.messageId, 'message id')

    const reactions = await reactionsService.removeReaction(chatId, messageId, req.user!.id)
    res.status(200).json({reactions})
}
