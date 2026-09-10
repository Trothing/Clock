import {useEffect, useState, type MouseEvent} from "react";
import {Archive, ArchiveRestore, Bell, BellOff, Bookmark, FileText, Image, Mic, Pin, PinOff, Settings, Trash2, User, Users} from "lucide-react";
import type {Chat} from "../../types/chats.type.ts";
import {Link, useParams} from "react-router-dom";
import {formatTime} from "../../utils/formatTime.ts";
import {getChatAvatarColor, getChatAvatarUrl, getChatTitle, isSavedChat} from "../../utils/chatTitle.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import useEscapeKey from "../../hooks/useEscapeKey.ts";
import useUpdateChatSettings from "../../queries/chats/useUpdateChatSettings.ts";
import useLeaveChat from "../../queries/chats/useLeaveChat.ts";
import {useConfirmDialog} from "../../providers/ConfirmDialogProvider.tsx";
import PresenceDot from "../PresenceDot/PresenceDot.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import styles from './ChatListItem.module.scss'

type ChatListItemProps = {
    chat: Chat
}

const MESSAGE_TYPE_ICON = {
    image: Image,
    file: FileText,
    system: Settings,
}

const ChatListItem = ({chat}: ChatListItemProps) => {
    const currentUserId = useAuthStore((state) => state.user?.id)
    const {id: activeChatId} = useParams()
    const isActive = Number(activeChatId) === chat.id
    const title = getChatTitle(chat)
    const time = chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : formatTime(chat.createdAt)

    const {mutate: updateSettings} = useUpdateChatSettings()
    const {mutate: leaveChat} = useLeaveChat()
    const {confirm} = useConfirmDialog()
    const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null)

    useEscapeKey(() => setMenuPos(null), !!menuPos)

    useEffect(() => {
        if (!menuPos) return
        const close = () => setMenuPos(null)
        window.addEventListener('click', close)
        window.addEventListener('scroll', close, true)
        return () => {
            window.removeEventListener('click', close)
            window.removeEventListener('scroll', close, true)
        }
    }, [menuPos])

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        setMenuPos({x: e.clientX, y: e.clientY})
    }

    const toggleSetting = (key: 'isPinned' | 'isMuted' | 'isArchived') => {
        updateSettings({chatId: chat.id, data: {[key]: !chat.settings[key]}})
        setMenuPos(null)
    }

    const handleDelete = async () => {
        setMenuPos(null)
        const message = chat.type === 'direct'
            ? 'Delete this conversation? It will disappear from your chat list, but the other person will keep their history.'
            : 'Leave this chat?'
        const ok = await confirm({message, confirmLabel: chat.type === 'direct' ? 'Delete' : 'Leave', danger: true})
        if (!ok) return
        leaveChat(chat.id)
    }

    const isVoiceMessage = chat.lastMessage?.type === 'file' && chat.lastMessage.attachmentMimeType === 'audio/webm'
    const TypeIcon = chat.type === 'group' ? Users : User
    const MessageIcon = chat.lastMessage && !chat.lastMessage.deletedAt && chat.lastMessage.type !== 'text'
        ? (isVoiceMessage ? Mic : MESSAGE_TYPE_ICON[chat.lastMessage.type])
        : null

    const isOwnMessage = chat.lastMessage?.senderId === currentUserId
    const isLastMessageDeleted = !!chat.lastMessage?.deletedAt
    const previewText = !chat.lastMessage
        ? 'No messages yet'
        : isLastMessageDeleted
            ? 'Message deleted'
            : chat.lastMessage.type === 'image' ? 'Photo' : chat.lastMessage.type === 'file' ? (isVoiceMessage ? 'Voice message' : 'File') : chat.lastMessage.content ?? ''

    const unreadCount = isActive ? 0 : chat.unreadCount
    const isUnread = unreadCount > 0

    const contextMenuItems = [
        {
            icon: chat.settings.isPinned ? PinOff : Pin,
            label: chat.settings.isPinned ? 'Unpin' : 'Pin',
            onClick: () => toggleSetting('isPinned'),
        },
        {
            icon: chat.settings.isMuted ? Bell : BellOff,
            label: chat.settings.isMuted ? 'Unmute' : 'Mute',
            onClick: () => toggleSetting('isMuted'),
        },
        {
            icon: chat.settings.isArchived ? ArchiveRestore : Archive,
            label: chat.settings.isArchived ? 'Unarchive' : 'Archive',
            onClick: () => toggleSetting('isArchived'),
        },
        {
            icon: Trash2,
            label: chat.type === 'direct' ? 'Delete' : 'Leave',
            onClick: handleDelete,
            danger: true,
        },
    ]

    return (
        <>
            <Link
                to={`/chats/${chat.id}`}
                className={`${styles.chatRow} ${isActive ? styles.chatRowActive : ''}`}
                onContextMenu={handleContextMenu}
            >
                <div className={styles.chatAvatarWrapper}>
                    {isSavedChat(chat) ? (
                        <div className={styles.chatAvatar} style={{background: 'var(--color-accent)'}}>
                            <Bookmark size={18} color="var(--color-on-accent)"/>
                        </div>
                    ) : (
                        <Avatar avatarUrl={getChatAvatarUrl(chat)} color={getChatAvatarColor(chat)} seed={title} className={styles.chatAvatar}/>
                    )}
                    {chat.type === 'direct' && !isSavedChat(chat) && (
                        <span className={styles.presenceBadge}>
                            <PresenceDot online={chat.otherUser?.status === 'online'} size={10}/>
                        </span>
                    )}
                </div>
                <div className={styles.chatInfo}>
                    <div className={styles.chatTopLine}>
                        <span className={styles.chatName}>
                            <TypeIcon size={13} className={styles.chatTypeIcon}/>
                            {title}
                            {chat.settings.isMuted && <BellOff size={12} className={styles.muteIcon}/>}
                        </span>
                        <span className={styles.chatTime}>{time}</span>
                    </div>
                    <div className={styles.chatBottomLine}>
                        {MessageIcon && <MessageIcon size={13} className={styles.messageTypeIcon}/>}
                        <span className={styles.chatPreview}>
                            {isOwnMessage && <span className={styles.previewSender}>You: </span>}
                            {previewText}
                        </span>
                        {isUnread && <span className={styles.unreadBadge}>{unreadCount}</span>}
                    </div>
                </div>
            </Link>

            {menuPos && (
                <div
                    className={styles.contextMenu}
                    style={{top: menuPos.y, left: menuPos.x}}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenuItems.map(({icon: Icon, label, onClick, danger}) => (
                        <button
                            key={label}
                            type="button"
                            className={`${styles.contextMenuItem} ${danger ? styles.contextMenuItemDanger : ''}`}
                            onClick={onClick}
                        >
                            <Icon size={14}/>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </>
    )
}

export default ChatListItem
