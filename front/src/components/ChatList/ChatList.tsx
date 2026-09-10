import {useMemo} from "react";
import type {Chat} from "../../types/chats.type.ts";
import ChatListItem from "../ChatListItem/ChatListItem.tsx";
import ChatListSkeleton from "../ChatListSkeleton/ChatListSkeleton.tsx";
import styles from './ChatList.module.scss'

type ChatFilter = 'all' | 'unread' | 'groups' | 'direct'

type ChatListProps = {
    chats: Chat[] | undefined
    isLoading: boolean
    isError: boolean
    activeFilter?: ChatFilter
}

const EMPTY_MESSAGES: Record<ChatFilter, string> = {
    all: 'No chats yet',
    unread: 'No unread chats',
    groups: 'No groups',
    direct: 'No direct chats',
}

function sortByLastMessage(chats: Chat[]) {
    return [...chats].sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
        return bTime - aTime
    })
}

const ChatList = ({chats, isLoading, isError, activeFilter = 'all'}: ChatListProps) => {
    const visibleChats = useMemo(() => chats?.filter((chat) => !chat.settings.isArchived) ?? [], [chats])
    const pinnedChats = useMemo(
        () => sortByLastMessage(visibleChats.filter((chat) => chat.settings.isPinned)),
        [visibleChats]
    )
    const otherChats = useMemo(
        () => sortByLastMessage(visibleChats.filter((chat) => !chat.settings.isPinned)),
        [visibleChats]
    )

    return (
        <div className={styles.chatList}>
            {isLoading && <ChatListSkeleton/>}
            {isError && <div className={styles.chatListState}>Failed to load chats</div>}

            {!isLoading && !isError && visibleChats.length === 0 && (
                <div className={styles.emptyState}>
                    <p>{EMPTY_MESSAGES[activeFilter]}</p>
                </div>
            )}

            {!isLoading && !isError && visibleChats.length > 0 && (
                <div className={styles.chatListItems}>
                    {pinnedChats.length > 0 && (
                        <>
                            <span className={styles.sectionLabel}>Pinned</span>
                            {pinnedChats.map((chat) => <ChatListItem key={chat.id} chat={chat}/>)}
                            {otherChats.length > 0 && <span className={styles.sectionLabel}>All chats</span>}
                        </>
                    )}
                    {otherChats.map((chat) => <ChatListItem key={chat.id} chat={chat}/>)}
                </div>
            )}
        </div>
    )
}

export default ChatList
