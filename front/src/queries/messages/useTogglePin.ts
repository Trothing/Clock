import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Message} from "../../types/messages.type.ts";
import {api} from "../../config/axios.ts";
import {patchMessage, type MessagesCache} from "../../utils/messagesCache.ts";

type TogglePinInput = {
    chatId: number
    messageId: number
    pinned: boolean
}

function useTogglePin() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({chatId, messageId, pinned}: TogglePinInput) => {
            const response = await api.patch(`/messages/${chatId}/${messageId}/${pinned ? 'pin' : 'unpin'}`)
            const {message} = response.data
            return message as Message
        },
        onSuccess: (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => patchMessage(old, message.id, () => message))
        }
    })
}

export default useTogglePin
