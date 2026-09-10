import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {CreateMessageFormData, Message} from "../../types/messages.type.ts";
import {api} from "../../config/axios.ts";
import {bumpChatPreview} from "../../utils/chatPreview.ts";
import {appendNewMessage, type MessagesCache} from "../../utils/messagesCache.ts";

function useCreateMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: CreateMessageFormData) => {
            const response = await api.post(`/messages/${data.chatId}`, data)
            const {message} = response.data
            return message
        },
        onSuccess: (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => appendNewMessage(old, message))
            bumpChatPreview(queryClient, message)
        }
    })
}

export default useCreateMessage