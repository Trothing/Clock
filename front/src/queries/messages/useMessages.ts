import {useInfiniteQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Message} from "../../types/messages.type.ts";

export const MESSAGES_PAGE_SIZE = 50

function useMessages(chatId: number) {
    return useInfiniteQuery({
        queryKey: ['messages', chatId],
        queryFn: async ({pageParam}): Promise<Message[]> => {
            const data = await api.get(`/messages/${chatId}`, {
                params: {limit: MESSAGES_PAGE_SIZE, before: pageParam},
            })
            return data.data.messages
        },
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.length < MESSAGES_PAGE_SIZE ? undefined : lastPage[lastPage.length - 1].id,
        select: (data) => [...data.pages].reverse().flatMap((page) => [...page].reverse()),
        enabled: !!chatId,
    })
}

export default useMessages
