import {useQuery} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";
import type {Attachment} from "../../types/messages.type.ts";

export type AttachmentCategory = 'media' | 'files' | 'voice'

function useChatAttachments(chatId: number, category: AttachmentCategory, enabled: boolean) {
    return useQuery({
        queryKey: ['chats', chatId, 'attachments', category],
        queryFn: async (): Promise<Attachment[]> => {
            const data = await api.get(`/messages/${chatId}/attachments`, {params: {type: category}})
            return data.data.attachments
        },
        enabled,
    })
}

export default useChatAttachments
