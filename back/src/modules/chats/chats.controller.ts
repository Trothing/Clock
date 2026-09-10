import {Request, Response} from "express";
import {createChatSchema, updateChatSchema} from "../../types/chats/chats.type.js";
import {createReportSchema} from "../../types/chats/reports.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import * as chatsService from "./chats.service.js"
import * as usersService from "../users/users.service.js"
import * as reportsService from "../reports/reports.service.js"
import {parseRouteId} from "../../utils/parseRouteId.js";

function parseChatId(rawId: string | string[]) {
    return parseRouteId(rawId, 'chat id')
}

export async function createChat(req: Request, res: Response){
    const result = createChatSchema.safeParse(req.body)

    if(!result.success){
        throw new AppError('Invalid format', 400)
    }

    const { chat, skippedMemberIds } = await chatsService.createChat(result.data, req.user!.id)

    res.status(201).json({ chat, skippedMemberIds })
}

export async function getChats(req: Request, res: Response) {
    const chats = await chatsService.getUserChats(req.user!.id)
    res.status(200).json({ chats })
}

export async function getSavedChat(req: Request, res: Response) {
    const chat = await chatsService.getOrCreateSavedChat(req.user!.id)
    res.status(200).json({ chat })
}

export async function getChat(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)
    const chat = await chatsService.getChatById(chatId, req.user!.id)
    res.status(200).json({ chat })
}

export async function updateChat(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)

    const result = updateChatSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const chat = await chatsService.updateChat(chatId, req.user!.id, result.data)
    res.status(200).json({ chat })
}

export async function leaveChat(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)
    await chatsService.leaveChat(chatId, req.user!.id)
    res.status(204).send()
}

export async function getChatMembers(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)
    await chatsService.getChatById(chatId, req.user!.id)

    const members = await usersService.getUsersByChatId(chatId)
    res.status(200).json({ members })
}

export async function reportChat(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)

    const result = createReportSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    await reportsService.reportChat(chatId, req.user!.id, result.data.reason)
    res.status(204).send()
}

export async function markChatAsRead(req: Request, res: Response) {
    const chatId = parseChatId(req.params.id)
    const rawMessageId = req.body?.messageId

    let messageId: number | undefined
    if (rawMessageId !== undefined) {
        messageId = Number(rawMessageId)
        if (!Number.isInteger(messageId)) {
            throw new AppError('Invalid message id', 400)
        }
    }

    await chatsService.markChatAsRead(chatId, req.user!.id, messageId)
    res.status(204).send()
}
