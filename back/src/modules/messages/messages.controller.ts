import {NextFunction, Request, Response} from "express";
import {AppError} from "../../shared/middleware/errorHandler.js";
import * as messageService from './messages.service.js'
import {createMessageSchema, updateMessageSchema} from "../../types/chats/messages.type.js";
import {parseRouteId} from "../../utils/parseRouteId.js";

function parseChatId(rawId: string | string[]) {
    return parseRouteId(rawId, 'chat id')
}

function parseMessageId(rawId: string | string[]) {
    return parseRouteId(rawId, 'message id')
}

const MAX_LIMIT = 100

function parsePositiveInt(raw: unknown, fieldName: string, max?: number) {
    if (raw === undefined) return undefined

    const value = Number(raw)
    if (typeof raw !== 'string' || !Number.isInteger(value) || value <= 0 || (max !== undefined && value > max)) {
        throw new AppError(`Invalid ${fieldName}`, 400)
    }
    return value
}

export async function getMessages(req: Request, res: Response, next: NextFunction){
    const chatId = parseChatId(req.params.chatId)
    const limit = parsePositiveInt(req.query.limit, 'limit', MAX_LIMIT)
    const before = parsePositiveInt(req.query.before, 'before')

    const messages = await messageService.getMessagesFromChat(chatId, limit, before, req.user!.id)
    res.status(200).json({ messages })
}

export async function createMessage(req: Request, res: Response, next: NextFunction){
    const result = createMessageSchema.safeParse(req.body)
    if(!result.success){
        throw new AppError('Invalid format', 400)
    }
    const newMessage = result.data
    const userId = req.user!.id

    const message = await messageService.createMessage(newMessage, userId)

    res.status(200).json({message})
}

export async function updateMessage(req: Request, res: Response, next: NextFunction){
    const chatId = parseChatId(req.params.chatId)
    const messageId = parseMessageId(req.params.messageId)

    const result = updateMessageSchema.safeParse(req.body)
    if(!result.success){
        throw new AppError('Invalid format', 400)
    }

    const message = await messageService.updateMessage(chatId, messageId, req.user!.id, result.data)
    res.status(200).json({message})
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction){
    const chatId = parseChatId(req.params.chatId)
    const messageId = parseMessageId(req.params.messageId)

    const message = await messageService.deleteMessage(chatId, messageId, req.user!.id)
    res.status(200).json({message})
}

export async function pinMessage(req: Request, res: Response) {
    const chatId = parseChatId(req.params.chatId)
    const messageId = parseMessageId(req.params.messageId)

    const message = await messageService.setMessagePinned(chatId, messageId, req.user!.id, true)
    res.status(200).json({message})
}

export async function unpinMessage(req: Request, res: Response) {
    const chatId = parseChatId(req.params.chatId)
    const messageId = parseMessageId(req.params.messageId)

    const message = await messageService.setMessagePinned(chatId, messageId, req.user!.id, false)
    res.status(200).json({message})
}

export async function getPinnedMessages(req: Request, res: Response) {
    const chatId = parseChatId(req.params.chatId)

    const messages = await messageService.getPinnedMessages(chatId, req.user!.id)
    res.status(200).json({messages})
}

export async function getMessagesWithLinks(req: Request, res: Response) {
    const chatId = parseChatId(req.params.chatId)

    const messages = await messageService.getMessagesWithLinks(chatId, req.user!.id)
    res.status(200).json({messages})
}

function parseAttachmentCategory(raw: unknown) {
    if (raw !== 'media' && raw !== 'files' && raw !== 'voice') {
        throw new AppError('Invalid attachment category', 400)
    }
    return raw
}

export async function getChatAttachments(req: Request, res: Response) {
    const chatId = parseChatId(req.params.chatId)
    const category = parseAttachmentCategory(req.query.type)

    const attachments = await messageService.getChatAttachments(chatId, req.user!.id, category)
    res.status(200).json({attachments})
}
