import {useQueryClient, useMutation} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat, CreateChatFormData} from "../../types/chats.type.ts";

type CreateChatResult = {
    chat: Chat
    skippedMemberIds: number[]
}

function useCreateChat (){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (chat: CreateChatFormData): Promise<CreateChatResult> => {
            const data = await api.post('/chats', chat)
            const {chat: createdChat, skippedMemberIds} = data.data
            return {chat: createdChat, skippedMemberIds: skippedMemberIds ?? []}
        },
        onSuccess: ({chat}: CreateChatResult) => {
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => [
                chat,
                ...old.filter((existing) => existing.id !== chat.id),
            ]);
        }
    })
}

export default useCreateChat
