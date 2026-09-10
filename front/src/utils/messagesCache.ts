import type {InfiniteData} from "@tanstack/react-query";
import type {Message} from "../types/messages.type.ts";

export type MessagesCache = InfiniteData<Message[], number | undefined>

export function appendNewMessage(old: MessagesCache | undefined, message: Message): MessagesCache {
    if (!old || old.pages.length === 0) {
        return {pages: [[message]], pageParams: [undefined]}
    }

    const [firstPage, ...restPages] = old.pages
    return {...old, pages: [[message, ...firstPage], ...restPages]}
}

export function patchMessage(
    old: MessagesCache | undefined,
    messageId: number,
    updater: (message: Message) => Message
): MessagesCache | undefined {
    if (!old) return old
    return {...old, pages: old.pages.map((page) => page.map((m) => m.id === messageId ? updater(m) : m))}
}
