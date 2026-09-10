import {db} from "../../config/db.js";
import {reportsTable} from "../../db/schemes/chats/reports.schema.js";

export async function createReport(reporterId: number, chatId: number, reason: string | undefined) {
    const [report] = await db.insert(reportsTable).values({reporterId, chatId, reason}).returning()
    return report
}
