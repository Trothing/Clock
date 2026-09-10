import {clearTimeout} from "node:timers";

type ChatId = number
type UserId = number

const typingUsers = new Map<ChatId, Map<UserId, NodeJS.Timeout>>

const TYPING_TIMEOUT = 5000

export function startTyping(chatId: ChatId, userId: UserId, onUpdate: (userIds: number[]) => void) {
    if(!typingUsers.has(chatId)){
        typingUsers.set(chatId, new Map())
    }
    const chatTyping = typingUsers.get(chatId)!

    const existingTimeout = chatTyping.get(userId)
    if(existingTimeout) clearTimeout(existingTimeout)

    const timeout = setTimeout(() => {
        chatTyping.delete(userId)
        onUpdate(Array.from(chatTyping.keys()))
    }, TYPING_TIMEOUT)

    chatTyping.set(userId, timeout);
    onUpdate(Array.from(chatTyping.keys()));
}
export function stopTyping(chatId: ChatId, userId: UserId, onUpdate: (userIds: number[]) => void) {
    const chatTyping = typingUsers.get(chatId);
    if (!chatTyping) return;

    const existingTimeout = chatTyping.get(userId);
    if (existingTimeout) clearTimeout(existingTimeout);

    chatTyping.delete(userId);
    onUpdate(Array.from(chatTyping.keys()));
}

export function stopAllTypingForUser(userId: UserId) {
    for (const [chatId, chatTyping] of typingUsers.entries()) {
        if (chatTyping.has(userId)) {
            const timeout = chatTyping.get(userId);
            if (timeout) clearTimeout(timeout);
            chatTyping.delete(userId);
        }
    }
}