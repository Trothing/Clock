import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Message} from "../../types/messages.type.ts";
import {api} from "../../config/axios.ts";
import {refreshChatPreview} from "../../utils/chatPreview.ts";
import {patchMessage, type MessagesCache} from "../../utils/messagesCache.ts";

type UpdateMessageInput = {
    chatId: number
    messageId: number
    content: string
}

function useUpdateMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({chatId, messageId, content}: UpdateMessageInput) => {
            const response = await api.patch(`/messages/${chatId}/${messageId}`, {content})
            const {message} = response.data
            return message as Message
        },
        onSuccess: (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => patchMessage(old, message.id, () => message))
            refreshChatPreview(queryClient, message)
        }
    })
}

export default useUpdateMessage
