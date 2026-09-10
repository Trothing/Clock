import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Chat, ChatSettings, UpdateChatSettingsFormData} from "../../types/chats.type.ts";

type UpdateChatSettingsInput = {
    chatId: number
    data: UpdateChatSettingsFormData
}

function useUpdateChatSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({chatId, data}: UpdateChatSettingsInput) => {
            const response = await api.patch(`/chats/${chatId}/settings`, data)
            const {settings} = response.data
            return {chatId, settings: settings as ChatSettings}
        },
        onSuccess: ({chatId, settings}) => {
            queryClient.setQueryData<Chat[]>(['chats'], (chats = []) =>
                chats.map((chat) => chat.id === chatId ? {...chat, settings} : chat))

            queryClient.setQueryData<Chat>(['chats', chatId], (chat) =>
                chat ? {...chat, settings} : chat)
        }
    })
}

export default useUpdateChatSettings
