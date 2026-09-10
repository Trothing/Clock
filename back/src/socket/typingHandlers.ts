import {z} from "zod";
import {AppServer, AppSocket} from "../types/socket.type.js";
import {startTyping, stopTyping} from "./typingState.js";

const typingPayloadSchema = z.object({chatId: z.number().int().positive()})

export function registerTypingHandlers(io: AppServer, socket: AppSocket){
    const userId = socket.data.user!.id

    const parseAndAuthorize = (payload: unknown) => {
        const parsed = typingPayloadSchema.safeParse(payload)
        if (!parsed.success) return null
        if (!socket.rooms.has(`chat:${parsed.data.chatId}`)) return null
        return parsed.data.chatId
    }

    socket.on('typing:start', (payload) => {
        const chatId = parseAndAuthorize(payload)
        if (chatId === null) return
        startTyping(chatId, userId, (userIds) => {
            io.to(`chat:${chatId}`).emit('typing:update', {chatId, userIds})
        })
    })
    socket.on('typing:stop', (payload) => {
        const chatId = parseAndAuthorize(payload)
        if (chatId === null) return
        stopTyping(chatId, userId, (userIds) => {
            io.to(`chat:${chatId}`).emit('typing:update', {chatId, userIds})
        })
    })
}