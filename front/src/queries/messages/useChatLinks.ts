import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Message} from "../../types/messages.type.ts";

function useChatLinks(chatId: number, enabled: boolean) {
    return useQuery({
        queryKey: ['chats', chatId, 'links'],
        queryFn: async (): Promise<Message[]> => {
            const data = await api.get(`/messages/${chatId}/links`)
            return data.data.messages
        },
        enabled,
    })
}

export default useChatLinks
