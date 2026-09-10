import {Router} from "express";
import {createChat, getChat, getChatMembers, getChats, getSavedChat, leaveChat, markChatAsRead, reportChat, updateChat} from "./chats.controller.js";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";
import chatSettingsRouter from "../chatSettings/chatSettings.router.js";

const chatsRouter = Router()

chatsRouter.use(authMiddleware)

chatsRouter.post('/', createChat)
chatsRouter.get('/', getChats)
chatsRouter.get('/saved', getSavedChat)
chatsRouter.get('/:id', getChat)
chatsRouter.get('/:id/members', getChatMembers)
chatsRouter.post('/:id/report', reportChat)
chatsRouter.patch('/:id', updateChat)
chatsRouter.delete('/:id', leaveChat)
chatsRouter.patch('/:id/read', markChatAsRead)
chatsRouter.use('/:id/settings', chatSettingsRouter)

export default chatsRouter
