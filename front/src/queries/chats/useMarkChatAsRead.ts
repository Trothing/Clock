import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat} from "../../types/chats.type.ts";

type MarkChatAsReadInput = {
    chatId: number
    messageId?: number
}

function useMarkChatAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({chatId, messageId}: MarkChatAsReadInput) => {
            await api.patch(`/chats/${chatId}/read`, messageId !== undefined ? {messageId} : {})
            return chatId
        },
        onSuccess: (chatId) => {
            const patch = (chat: Chat): Chat => chat.id === chatId ? {...chat, unreadCount: 0} : chat
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.map(patch))
            queryClient.setQueryData<Chat>(['chats', chatId], (chat) => chat ? patch(chat) : chat)
        }
    })
}

export default useMarkChatAsRead
