import type {QueryClient} from "@tanstack/react-query";
import type {Chat, LastMessagePreview} from "../types/chats.type.ts";
import type {Message} from "../types/messages.type.ts";

function patchChats(queryClient: QueryClient, patch: (chat: Chat) => Chat) {
    const old = queryClient.getQueryData<Chat[]>(['chats'])
    if (!old) return
    queryClient.setQueryData<Chat[]>(['chats'], old.map(patch))
}

function toLastMessagePreview(message: Message): LastMessagePreview {
    return {
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        senderId: message.senderId,
        deletedAt: message.deletedAt,
        attachmentMimeType: message.attachments[0]?.mimeType ?? null,
    }
}

export function bumpChatPreview(queryClient: QueryClient, message: Message) {
    const old = queryClient.getQueryData<Chat[]>(['chats'])
    if (!old) return

    const idx = old.findIndex((c) => c.id === message.chatId)
    if (idx === -1) {
        queryClient.invalidateQueries({queryKey: ['chats']})
        return
    }

    const updated = {...old[idx], lastMessageId: message.id, lastMessage: toLastMessagePreview(message)}
    queryClient.setQueryData<Chat[]>(['chats'], [updated, ...old.filter((_, i) => i !== idx)])
}

export function refreshChatPreview(queryClient: QueryClient, message: Message) {
    patchChats(queryClient, (chat) =>
        chat.id === message.chatId && chat.lastMessageId === message.id
            ? {...chat, lastMessage: toLastMessagePreview(message)}
            : chat)
}
