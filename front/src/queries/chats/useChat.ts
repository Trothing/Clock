import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat} from "../../types/chats.type.ts";

function useChat (chatId: number){
    return useQuery({
        queryKey: ['chats', chatId],
        queryFn: async (): Promise<Chat> => {
            const data = await api.get(`/chats/${chatId}`)
            const {chat} = data.data
            return chat
        },
        enabled: !!chatId,
    })
}

export default useChat
