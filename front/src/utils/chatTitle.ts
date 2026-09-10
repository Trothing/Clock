import type {Chat} from "../types/chats.type.ts";

export function isSavedChat(chat: Chat): boolean {
    return chat.type === 'direct' && chat.isSelfChat
}

export function getChatTitle(chat: Chat): string {
    if (isSavedChat(chat)) {
        return 'Saved Messages'
    }
    if (chat.type === 'direct') {
        return chat.otherUser?.name || chat.otherUser?.username || 'Direct chat'
    }
    return chat.name ?? 'Group chat'
}

export function getChatAvatarUrl(chat: Chat): string | null {
    if (chat.type === 'direct') {
        return chat.otherUser?.avatarUrl ?? null
    }
    return chat.avatarUrl
}

export function getChatAvatarColor(chat: Chat): string | null {
    if (chat.type === 'direct') {
        return chat.otherUser?.avatarColor ?? null
    }
    return null
}
