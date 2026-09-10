import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {ReactionSummary} from "../../types/messages.type.ts";
import {patchMessage, type MessagesCache} from "../../utils/messagesCache.ts";

type ToggleReactionInput = {
    chatId: number
    messageId: number
    emoji: string
    remove: boolean
}

function useToggleReaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({chatId, messageId, emoji, remove}: ToggleReactionInput) => {
            const response = remove
                ? await api.delete(`/messages/${chatId}/${messageId}/reactions`)
                : await api.post(`/messages/${chatId}/${messageId}/reactions`, {emoji})
            const {reactions} = response.data
            return {chatId, messageId, reactions: reactions as ReactionSummary[]}
        },
        onSuccess: ({chatId, messageId, reactions}) => {
            queryClient.setQueryData<MessagesCache>(['messages', chatId], (old) =>
                patchMessage(old, messageId, (m) => ({...m, reactions})))
        }
    })
}

export default useToggleReaction
