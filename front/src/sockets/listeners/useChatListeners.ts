import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import type {Chat} from "../../types/chats.type.ts";
import {socket} from "../socket.ts";

function useChatListeners () {
    const queryClient = useQueryClient()

    useEffect(() => {
        const handleChatCreated = (chat: Chat)=> {
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => [chat, ...old])
        }
        const handleChatDeleted = (chat: Chat)=> {
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.filter((c) => c.id!==chat.id))
        }
        const handleChatUpdated = (chat: Chat) => {
            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.map((c) => c.id === chat.id ? chat : c))
            queryClient.setQueryData<Chat>(['chats', chat.id], chat)
        }
        const handlePresenceUpdate = ({userId, status}: {userId: number, status: 'online' | 'offline'}) => {
            const patchChat = (chat: Chat): Chat =>
                chat.otherUser?.id === userId
                    ? {...chat, otherUser: {...chat.otherUser, status}}
                    : chat

            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.map(patchChat))
            queryClient.setQueriesData<Chat>(
                {predicate: (query) => query.queryKey[0] === 'chats' && query.queryKey.length === 2},
                (chat) => chat ? patchChat(chat) : chat
            )
        }
        const handleChatRead = ({userId, lastReadMessageId}: {chatId: number, userId: number, lastReadMessageId: number}) => {
            const patchChat = (chat: Chat): Chat =>
                chat.otherUser?.id === userId
                    ? {...chat, otherUser: {...chat.otherUser, lastReadMessageId}}
                    : chat

            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.map(patchChat))
            queryClient.setQueriesData<Chat>(
                {predicate: (query) => query.queryKey[0] === 'chats' && query.queryKey.length === 2},
                (chat) => chat ? patchChat(chat) : chat
            )
        }

        const handleUserUpdated = (user: {id: number, name: string | null, username: string, avatarUrl: string | null}) => {
            const patchChat = (chat: Chat): Chat =>
                chat.otherUser?.id === user.id
                    ? {...chat, otherUser: {...chat.otherUser, name: user.name, username: user.username, avatarUrl: user.avatarUrl}}
                    : chat

            queryClient.setQueryData<Chat[]>(['chats'], (old = []) => old.map(patchChat))
            queryClient.setQueriesData<Chat>(
                {predicate: (query) => query.queryKey[0] === 'chats' && query.queryKey.length === 2},
                (chat) => chat ? patchChat(chat) : chat
            )
        }

        socket.on('chat:created', handleChatCreated)
        socket.on('chat:deleted', handleChatDeleted)
        socket.on('chat:updated', handleChatUpdated)
        socket.on('presence:update', handlePresenceUpdate)
        socket.on('chat:read', handleChatRead)
        socket.on('user:updated', handleUserUpdated)

        return () => {
            socket.off('chat:created', handleChatCreated)
            socket.off('chat:deleted', handleChatDeleted)
            socket.off('chat:updated', handleChatUpdated)
            socket.off('presence:update', handlePresenceUpdate)
            socket.off('chat:read', handleChatRead)
            socket.off('user:updated', handleUserUpdated)
        }
    }, [queryClient])
}
export default useChatListeners
