import { eq } from 'drizzle-orm';
import {chatMembersTable} from "../db/index.js";
import {db} from "../config/db.js";
import type {AppSocket} from "../types/socket.type.js";

export async function handleConnection(socket: AppSocket) {
    const userId = socket.data.user?.id;
    if (!userId) {
        return
    }

    const memberships = await db.select({ chatId: chatMembersTable.chatId })
        .from(chatMembersTable)
        .where(eq(chatMembersTable.userId, userId));

    for (const { chatId } of memberships) {
        socket.join(`chat:${chatId}`);
    }

    socket.join(`user:${userId}`);
}