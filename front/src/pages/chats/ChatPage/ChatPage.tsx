import {useState, useEffect, useCallback} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Archive,
    ArchiveRestore,
    Bell,
    BellOff,
    Bookmark,
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    Info,
    LogOut,
    MoreVertical,
    Pin,
    Search,
    User,
    Users,
    X,
} from "lucide-react";
import useChat from "../../../queries/chats/useChat.ts";
import useLeaveChat from "../../../queries/chats/useLeaveChat.ts";
import useUpdateChatSettings from "../../../queries/chats/useUpdateChatSettings.ts";
import useMarkChatAsRead from "../../../queries/chats/useMarkChatAsRead.ts";
import useMessages from "../../../queries/messages/useMessages.ts";
import useCreateMessage from "../../../queries/messages/useCreateMessage.ts";
import useUpdateMessage from "../../../queries/messages/useUpdateMessage.ts";
import useDeleteMessage from "../../../queries/messages/useDeleteMessage.ts";
import useTypingIndicator from "../../../sockets/listeners/useTypingIndicator.ts";
import {useAuthStore} from "../../../store/auth.store.ts";
import {socket} from "../../../sockets/socket.ts";
import type {Chat} from "../../../types/chats.type.ts";
import type {AttachmentInput, Message} from "../../../types/messages.type.ts";
import {getChatAvatarColor, getChatAvatarUrl, getChatTitle, isSavedChat} from "../../../utils/chatTitle.ts";
import {formatTime} from "../../../utils/formatTime.ts";
import {getErrorMessage} from "../../../utils/error.ts";
import useEscapeKey from "../../../hooks/useEscapeKey.ts";
import useBlockedUsers from "../../../queries/blockedUsers/useBlockedUsers.ts";
import useUnblockUser from "../../../queries/blockedUsers/useUnblockUser.ts";
import {useConfirmDialog} from "../../../providers/ConfirmDialogProvider.tsx";
import ChatPageSkeleton from "../../../components/ChatPageSkeleton/ChatPageSkeleton.tsx";
import MessageList from "../../../components/MessageList/MessageList.tsx";
import MessageInput from "../../../components/MessageInput/MessageInput.tsx";
import PresenceDot from "../../../components/PresenceDot/PresenceDot.tsx";
import Avatar from "../../../components/Avatar/Avatar.tsx";
import TypingIndicator from "../../../components/TypingIndicator/TypingIndicator.tsx";
import ChatInfoPanel from "../../../components/ChatInfoPanel/ChatInfoPanel.tsx";
import bubbleStyles from "../../../components/MessageBubble/MessageBubble.module.scss";
import {getInfoPanelOpen, setInfoPanelOpenSetting} from "../../../utils/infoPanelSettings.ts";
import styles from './ChatPage.module.scss'

const ChatPage = () => {
    const {id} = useParams()
    const chatId = Number(id)
    const navigate = useNavigate()
    const currentUserId = useAuthStore((state) => state.user?.id)

    const {data: chat, isLoading, isError} = useChat(chatId)
    const {mutate: leaveChat, isPending: isLeaving} = useLeaveChat()
    const {confirm} = useConfirmDialog()
    const {mutate: updateSettings} = useUpdateChatSettings()
    const {mutate: markAsRead} = useMarkChatAsRead()
    const {
        data: messages,
        isLoading: messagesLoading,
        fetchNextPage: fetchOlderMessages,
        hasNextPage: hasOlderMessages,
        isFetchingNextPage: isFetchingOlderMessages,
    } = useMessages(chatId)
    const {mutate: createMessage} = useCreateMessage()
    const {mutate: updateMessage} = useUpdateMessage()
    const {mutate: deleteMessage} = useDeleteMessage()
    const {typingUserIds, notifyTyping, notifyStoppedTyping} = useTypingIndicator(chatId)
    const {data: blockedUsers} = useBlockedUsers()
    const {mutate: unblockUser, isPending: isUnblocking} = useUnblockUser()

    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const [editingMessage, setEditingMessage] = useState<Message | null>(null)
    const [sendError, setSendError] = useState<string | null>(null)
    const [infoPanelOpen, setInfoPanelOpenState] = useState(getInfoPanelOpen)
    const [moreMenuOpen, setMoreMenuOpen] = useState(false)
    const [pinnedMenuOpen, setPinnedMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchMatchIndex, setSearchMatchIndex] = useState(0)

    useEscapeKey(() => {
        setMoreMenuOpen(false)
        setPinnedMenuOpen(false)
    }, moreMenuOpen || pinnedMenuOpen)

    const setInfoPanelOpen = (open: boolean | ((prev: boolean) => boolean)) => {
        setInfoPanelOpenState((prev) => {
            const next = typeof open === 'function' ? open(prev) : open
            setInfoPanelOpenSetting(next)
            return next
        })
    }

    useEffect(() => {
        setReplyingTo(null)
        setEditingMessage(null)
        setMoreMenuOpen(false)
        setPinnedMenuOpen(false)
        setSearchOpen(false)
        setSearchQuery('')
    }, [chatId])

    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null
    const lastMessageId = lastMessage?.id
    const lastMessageSenderId = lastMessage?.senderId

    useEffect(() => {
        if (lastMessageId === undefined || lastMessageSenderId === currentUserId) return
        markAsRead({chatId, messageId: lastMessageId})
    }, [chatId, lastMessageId, lastMessageSenderId, markAsRead, currentUserId])

    useEffect(() => {
        setSearchMatchIndex(0)
    }, [searchQuery])

    useEffect(() => {
        const handleChatDeleted = (deletedChat: Chat) => {
            if (deletedChat.id === chatId) {
                navigate('/')
            }
        }
        socket.on('chat:deleted', handleChatDeleted)
        return () => {
            socket.off('chat:deleted', handleChatDeleted)
        }
    }, [chatId, navigate])

    useEffect(() => {
        setSendError(null)
    }, [chatId])

    const handleUnblock = () => {
        if (chat?.otherUser?.id) unblockUser(chat.otherUser.id)
    }

    const handleLeave = async () => {
        const message = chat?.type === 'direct'
            ? 'Delete this conversation? It will disappear from your chat list, but the other person will keep their history.'
            : 'Leave this chat?'
        const ok = await confirm({message, confirmLabel: chat?.type === 'direct' ? 'Delete' : 'Leave', danger: true})
        if (!ok) return
        leaveChat(chatId, {onSuccess: () => navigate('/')})
    }

    const handleSend = (content: string, replyToMessageId?: number, attachment?: AttachmentInput) => {
        const type = !attachment ? 'text' : attachment.mimeType.startsWith('image/') ? 'image' : 'file'
        createMessage({chatId, content: content || undefined, type, replyToMessageId, attachment}, {
            onError: (err) => setSendError(getErrorMessage(err, 'Failed to send message')),
        })
        setReplyingTo(null)
    }

    const handleEditSubmit = (messageId: number, content: string) => {
        updateMessage({chatId, messageId, content})
        setEditingMessage(null)
    }

    const handleDeleteMessage = useCallback(async (message: Message) => {
        const ok = await confirm({message: 'Delete this message?', confirmLabel: 'Delete', danger: true})
        if (!ok) return
        deleteMessage({chatId, messageId: message.id})
    }, [chatId, deleteMessage, confirm])

    const handleReply = useCallback((message: Message) => {
        setEditingMessage(null)
        setReplyingTo(message)
    }, [])

    const handleEdit = useCallback((message: Message) => {
        setReplyingTo(null)
        setEditingMessage(message)
    }, [])

    const scrollToMessage = (messageId: number) => {
        const el = document.getElementById(`message-${messageId}`)
        if (!el) return
        el.scrollIntoView({block: 'center', behavior: 'smooth'})
        el.classList.add(bubbleStyles.highlight)
        setTimeout(() => el.classList.remove(bubbleStyles.highlight), 1200)
    }

    const pinnedPreviewLabel = (message: Message) =>
        message.type === 'image' ? 'Photo' : message.type === 'file' ? 'File' : message.content ?? ''

    if (isLoading) {
        return <ChatPageSkeleton/>
    }

    if (isError || !chat) {
        return (
            <div className={styles.state}>
                <p>Failed to open this chat</p>
            </div>
        )
    }

    const title = getChatTitle(chat)
    const isSaved = isSavedChat(chat)
    const TypeIcon = isSaved ? Bookmark : chat.type === 'group' ? Users : User
    const isBlockedByMe = !!chat.otherUser?.id && !!blockedUsers?.some((b) => b.user.id === chat.otherUser?.id)
    const pinnedMessages = (messages ?? []).filter((m) => m.pinnedAt)

    const searchMatches = searchQuery.trim()
        ? (messages ?? []).filter((m) => !m.deletedAt && m.content?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        : []

    const goToSearchMatch = (index: number) => {
        if (searchMatches.length === 0) return
        const wrapped = ((index % searchMatches.length) + searchMatches.length) % searchMatches.length
        setSearchMatchIndex(wrapped)
        scrollToMessage(searchMatches[wrapped].id)
    }

    const subtitle = isSaved
        ? 'Only you'
        : chat.type === 'group'
            ? 'Group'
            : chat.otherUser?.status === 'online'
                ? 'Online'
                : chat.otherUser?.lastSeenAt
                    ? `Last seen ${formatTime(chat.otherUser.lastSeenAt)}`
                    : 'Offline'

    const moreMenuItems = [
        {
            icon: chat.settings.isMuted ? Bell : BellOff,
            label: chat.settings.isMuted ? 'Unmute notifications' : 'Mute notifications',
            onClick: () => {
                updateSettings({chatId, data: {isMuted: !chat.settings.isMuted}})
                setMoreMenuOpen(false)
            },
        },
        {
            icon: chat.settings.isArchived ? ArchiveRestore : Archive,
            label: chat.settings.isArchived ? 'Unarchive chat' : 'Archive chat',
            onClick: () => {
                updateSettings({chatId, data: {isArchived: !chat.settings.isArchived}})
                setMoreMenuOpen(false)
            },
        },
        {
            icon: Search,
            label: 'Search in chat',
            onClick: () => {
                setSearchOpen(true)
                setMoreMenuOpen(false)
            },
        },
    ]

    return (
        <div className={styles.chatPage}>
            <div className={styles.mainColumn}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <button type="button" className={styles.mobileBackButton} onClick={() => navigate('/')} title="Back to chats">
                            <ChevronLeft size={20}/>
                        </button>
                        <div className={styles.avatarWrapper}>
                            {isSaved ? (
                                <div className={styles.avatar} style={{background: 'var(--color-accent)'}}>
                                    <Bookmark size={20} color="var(--color-on-accent)"/>
                                </div>
                            ) : (
                                <Avatar avatarUrl={getChatAvatarUrl(chat)} color={getChatAvatarColor(chat)} seed={title} className={styles.avatar}/>
                            )}
                            {chat.type === 'direct' && !isSaved && (
                                <span className={styles.presenceBadge}>
                                    <PresenceDot online={chat.otherUser?.status === 'online'} size={11}/>
                                </span>
                            )}
                        </div>
                        <div className={styles.headerText}>
                            <span className={styles.title}>{title}</span>
                            <span className={styles.subtitle}>
                                <TypeIcon size={12}/>
                                {subtitle}
                            </span>
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={`${styles.headerIconButton} ${searchOpen ? styles.headerIconButtonActive : ''}`}
                            title="Search in chat"
                            onClick={() => setSearchOpen((prev) => !prev)}
                        >
                            <Search size={17}/>
                        </button>
                        {pinnedMessages.length > 0 && (
                            <div className={styles.pinnedMenuWrapper}>
                                <button
                                    type="button"
                                    className={styles.headerIconButton}
                                    title="Pinned messages"
                                    onClick={() => setPinnedMenuOpen((prev) => !prev)}
                                >
                                    <Pin size={16}/>
                                    <span className={styles.pinBadge}>{pinnedMessages.length}</span>
                                </button>
                                {pinnedMenuOpen && (
                                    <>
                                        <div className={styles.moreDropdownBackdrop} onClick={() => setPinnedMenuOpen(false)}/>
                                        <div className={styles.pinnedDropdown}>
                                            {pinnedMessages.map((message) => (
                                                <button
                                                    key={message.id}
                                                    type="button"
                                                    className={styles.pinnedDropdownItem}
                                                    onClick={() => {
                                                        scrollToMessage(message.id)
                                                        setPinnedMenuOpen(false)
                                                    }}
                                                >
                                                    <span className={styles.pinnedDropdownSender}>
                                                        {message.sender?.name || message.sender?.username || 'Someone'}
                                                    </span>
                                                    <span className={styles.pinnedDropdownText}>{pinnedPreviewLabel(message)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            className={`${styles.headerIconButton} ${infoPanelOpen ? styles.headerIconButtonActive : ''}`}
                            title="Chat info"
                            onClick={() => setInfoPanelOpen((prev) => !prev)}
                        >
                            <Info size={18}/>
                        </button>
                        <div className={styles.moreMenuWrapper}>
                            <button
                                type="button"
                                className={styles.headerIconButton}
                                title="More"
                                onClick={() => setMoreMenuOpen((prev) => !prev)}
                            >
                                <MoreVertical size={18}/>
                            </button>
                            {moreMenuOpen && (
                                <>
                                    <div className={styles.moreDropdownBackdrop} onClick={() => setMoreMenuOpen(false)}/>
                                    <div className={styles.moreDropdown}>
                                        {moreMenuItems.map(({icon: Icon, label, onClick}) => (
                                            <button
                                                key={label}
                                                type="button"
                                                className={styles.moreDropdownItem}
                                                onClick={onClick}
                                            >
                                                <Icon size={15}/>
                                                <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            className={styles.leaveButton}
                            onClick={handleLeave}
                            disabled={isLeaving}
                            title={chat.type === 'group' ? 'Leave chat' : 'Delete chat'}
                        >
                            <LogOut size={18}/>
                        </button>
                    </div>
                </div>

                {searchOpen && (
                    <div className={styles.searchBar}>
                        <Search size={15} className={styles.searchBarIcon}/>
                        <input
                            type="text"
                            autoFocus
                            className={styles.searchBarInput}
                            placeholder="Search in chat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') goToSearchMatch(searchMatchIndex + (e.shiftKey ? -1 : 1))
                                if (e.key === 'Escape') setSearchOpen(false)
                            }}
                        />
                        <span className={styles.searchBarCount}>
                            {searchQuery.trim() ? (searchMatches.length > 0 ? `${searchMatchIndex + 1}/${searchMatches.length}` : '0/0') : ''}
                        </span>
                        <button
                            type="button"
                            className={styles.searchBarNavButton}
                            onClick={() => goToSearchMatch(searchMatchIndex - 1)}
                            disabled={searchMatches.length === 0}
                            title="Previous match"
                        >
                            <ChevronUp size={15}/>
                        </button>
                        <button
                            type="button"
                            className={styles.searchBarNavButton}
                            onClick={() => goToSearchMatch(searchMatchIndex + 1)}
                            disabled={searchMatches.length === 0}
                            title="Next match"
                        >
                            <ChevronDown size={15}/>
                        </button>
                        <button type="button" className={styles.searchBarClose} onClick={() => setSearchOpen(false)} title="Close">
                            <X size={15}/>
                        </button>
                    </div>
                )}

                <div className={styles.messagesArea}>
                    <MessageList
                        key={chatId}
                        messages={messages ?? []}
                        currentUserId={currentUserId}
                        isGroup={chat.type === 'group'}
                        otherUserLastReadMessageId={isSavedChat(chat) ? Infinity : chat.otherUser?.lastReadMessageId}
                        isLoading={messagesLoading}
                        hasOlderMessages={hasOlderMessages}
                        isLoadingOlderMessages={isFetchingOlderMessages}
                        onLoadOlderMessages={fetchOlderMessages}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDeleteMessage}
                    />
                </div>

                <div className={styles.footer}>
                    {isBlockedByMe ? (
                        <div className={styles.unblockBar}>
                            <button
                                type="button"
                                className={styles.unblockButton}
                                onClick={handleUnblock}
                                disabled={isUnblocking}
                            >
                                Unblock
                            </button>
                        </div>
                    ) : (
                        <>
                            <TypingIndicator typingUserIds={typingUserIds} currentUserId={currentUserId} chat={chat}/>

                            {sendError && (
                                <div className={styles.blockedBanner}>{sendError}</div>
                            )}

                            <MessageInput
                                onSend={handleSend}
                                onEditSubmit={handleEditSubmit}
                                onTyping={notifyTyping}
                                onStoppedTyping={notifyStoppedTyping}
                                replyingTo={replyingTo}
                                onCancelReply={() => setReplyingTo(null)}
                                editingMessage={editingMessage}
                                onCancelEdit={() => setEditingMessage(null)}
                            />
                        </>
                    )}
                </div>
            </div>

            {infoPanelOpen && <ChatInfoPanel key={chat.id} chat={chat} onClose={() => setInfoPanelOpen(false)}/>}
        </div>
    )
}

export default ChatPage
