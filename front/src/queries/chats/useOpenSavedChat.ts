import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat} from "../../types/chats.type.ts";

function useOpenSavedChat() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (): Promise<Chat> => {
            const response = await api.get('/chats/saved')
            return response.data.chat
        },
        onSuccess: (chat: Chat) => {
            queryClient.setQueryData(['chats', chat.id], chat)
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) =>
                old.some((c) => c.id === chat.id) ? old : [chat, ...old])
        }
    })
}

export default useOpenSavedChat
