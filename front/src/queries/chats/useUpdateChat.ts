import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat, UpdateChatFormData} from "../../types/chats.type.ts";

type UpdateChatInput = {
    chatId: number
    data: UpdateChatFormData
}

function useUpdateChat() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({chatId, data}: UpdateChatInput) => {
            const response = await api.patch(`/chats/${chatId}`, data)
            return response.data.chat as Chat
        },
        onSuccess: (chat) => {
            queryClient.setQueryData<Chat[]>(['chats'], (chats = []) =>
                chats.map((c) => c.id === chat.id ? chat : c))
            queryClient.setQueryData<Chat>(['chats', chat.id], chat)
        }
    })
}

export default useUpdateChat
