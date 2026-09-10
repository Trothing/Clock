import * as reportsRepository from './reports.repository.js'
import {getChatById} from "../chats/chats.service.js";

export async function reportChat(chatId: number, reporterId: number, reason: string | undefined) {
    await getChatById(chatId, reporterId)
    return reportsRepository.createReport(reporterId, chatId, reason)
}
