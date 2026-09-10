import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";

export type ChatMember = {
    id: number
    username: string
    name: string | null
    avatarUrl: string | null
    avatarColor: string | null
    role: 'admin' | 'member'
}

function useChatMembers(chatId: number, enabled: boolean) {
    return useQuery({
        queryKey: ['chats', chatId, 'members'],
        queryFn: async (): Promise<ChatMember[]> => {
            const data = await api.get(`/chats/${chatId}/members`)
            return data.data.members
        },
        enabled,
    })
}

export default useChatMembers
