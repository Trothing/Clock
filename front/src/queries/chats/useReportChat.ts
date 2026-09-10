import {useMutation} from "@tanstack/react-query";
import {api} from "../../config/axios.ts";

type ReportChatInput = {
    chatId: number
    reason?: string
}

function useReportChat() {
    return useMutation({
        mutationFn: async ({chatId, reason}: ReportChatInput) => {
            await api.post(`/chats/${chatId}/report`, {reason})
        },
    })
}

export default useReportChat
