import {Router} from "express";
import {
    createMessage,
    deleteMessage,
    getChatAttachments,
    getMessages,
    getMessagesWithLinks,
    getPinnedMessages,
    pinMessage,
    unpinMessage,
    updateMessage,
} from "./messages.controller.js";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";
import {messageRateLimiter} from "../../shared/middleware/rateLimit.middleware.js";
import reactionsRouter from "../reactions/reactions.router.js";

const messageRouter = Router()

messageRouter.use(authMiddleware)

messageRouter.get('/:chatId/pinned', getPinnedMessages)
messageRouter.get('/:chatId/links', getMessagesWithLinks)
messageRouter.get('/:chatId/attachments', getChatAttachments)
messageRouter.get('/:chatId', getMessages)
messageRouter.post('/:chatId', messageRateLimiter, createMessage)
messageRouter.patch('/:chatId/:messageId', updateMessage)
messageRouter.delete('/:chatId/:messageId', deleteMessage)
messageRouter.patch('/:chatId/:messageId/pin', pinMessage)
messageRouter.patch('/:chatId/:messageId/unpin', unpinMessage)
messageRouter.use('/:chatId/:messageId/reactions', reactionsRouter)

export default messageRouter
