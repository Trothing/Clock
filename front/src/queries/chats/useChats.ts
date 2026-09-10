import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat} from "../../types/chats.type.ts";

function useChats (){
    return useQuery({
        queryKey: ['chats'],
        queryFn: async (): Promise<Chat[]> => {
            const data = await api.get('/chats')
            const { chats } = data.data
            return chats
        },
        staleTime: 60_000,
    })
}

export default useChats