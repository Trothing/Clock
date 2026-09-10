import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket.ts";
import type {Chat} from "../../types/chats.type.ts";
import type {Message, ReactionSummary} from "../../types/messages.type.ts";
import {playNotificationSound} from "../../utils/notificationSound.ts";
import {getSoundEnabled} from "../../utils/soundSettings.ts";
import {bumpChatPreview, refreshChatPreview} from "../../utils/chatPreview.ts";
import {appendNewMessage, patchMessage, type MessagesCache} from "../../utils/messagesCache.ts";

function isChatOpenAndFocused(chatId: number) {
    if (!document.hasFocus()) return false
    return window.location.pathname === `/chats/${chatId}`
}

type ReactionsUpdatedPayload = {
    chatId: number
    messageId: number
    reactions: ReactionSummary[]
}

export function useMessageListeners() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleMessageCreated = (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => appendNewMessage(old, message));
            bumpChatPreview(queryClient, message);

            const chats = queryClient.getQueryData<Chat[]>(['chats']);
            const chat = chats?.find((c) => c.id === message.chatId);
            const isMuted = chat?.settings.isMuted ?? false;

            if (!isMuted && getSoundEnabled() && !isChatOpenAndFocused(message.chatId)) {
                playNotificationSound();
            }
        };

        const handleMessageUpdated = (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => patchMessage(old, message.id, () => message));
            refreshChatPreview(queryClient, message);
        };

        const handleMessageDeleted = (message: Message) => {
            queryClient.setQueryData<MessagesCache>(['messages', message.chatId], (old) => patchMessage(old, message.id, () => message));
            refreshChatPreview(queryClient, message);
        };

        const handleReactionsUpdated = ({chatId, messageId, reactions}: ReactionsUpdatedPayload) => {
            queryClient.setQueryData<MessagesCache>(['messages', chatId], (old) =>
                patchMessage(old, messageId, (m) => ({...m, reactions})));
        };

        socket.on('message:created', handleMessageCreated);
        socket.on('message:updated', handleMessageUpdated);
        socket.on('message:deleted', handleMessageDeleted);
        socket.on('message:reactionsUpdated', handleReactionsUpdated);

        return () => {
            socket.off('message:created', handleMessageCreated);
            socket.off('message:updated', handleMessageUpdated);
            socket.off('message:deleted', handleMessageDeleted);
            socket.off('message:reactionsUpdated', handleReactionsUpdated);
        };
    }, [queryClient]);
}
