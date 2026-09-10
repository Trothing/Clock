import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Message} from "../../types/messages.type.ts";
import {api} from "../../config/axios.ts";
import {bumpChatPreview} from "../../utils/chatPreview.ts";
import {appendNewMessage, type MessagesCache} from "../../utils/messagesCache.ts";

type ForwardMessageInput = {
    targetChatId: number
    message: Message
}

function useForwardMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({targetChatId, message}: ForwardMessageInput) => {
            const attachment = message.attachments[0]
            const response = await api.post(`/messages/${targetChatId}`, {
                chatId: targetChatId,
                type: message.type,
                content: message.content ?? undefined,
                attachment: attachment ? {
                    url: attachment.url,
                    mimeType: attachment.mimeType,
                    size: attachment.size,
                    width: attachment.width ?? undefined,
                    height: attachment.height ?? undefined,
                    duration: attachment.duration ?? undefined,
                } : undefined,
                forwardedFromSenderId: message.sender?.id,
                forwardedFromSenderName: message.sender?.name || message.sender?.username,
            })
            const {message: created} = response.data
            return created as Message
        },
        onSuccess: (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => appendNewMessage(old, message))
            bumpChatPreview(queryClient, message)
        }
    })
}

export default useForwardMessage
