import {useQueryClient, useMutation} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat} from "../../types/chats.type.ts";

function useLeaveChat (){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (chatId: number) => {
            await api.delete(`/chats/${chatId}`)
            return chatId
        },
        onSuccess: (chatId) => {
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.filter((c) => c.id !== chatId));
            queryClient.removeQueries({queryKey: ['chats', chatId]})
        }
    })
}

export default useLeaveChat
