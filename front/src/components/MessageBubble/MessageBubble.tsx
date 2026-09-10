import {memo, useEffect, useRef, useState} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {Check, CheckCheck, Download, File as FileIcon, Forward, Maximize2, Pencil, Pin, PinOff, Reply, Smile, Trash2, X} from "lucide-react";
import type {Attachment, Message} from "../../types/messages.type.ts";
import {formatMessageTime} from "../../utils/formatTime.ts";
import {renderMessageTextHtml} from "../../utils/renderMessageText.ts";
import {formatFileSize, getFileExtension, getFileName} from "../../utils/fileFormat.ts";
import {downloadFile} from "../../utils/download.ts";
import useEscapeKey from "../../hooks/useEscapeKey.ts";
import useToggleReaction from "../../queries/messages/useToggleReaction.ts";
import useTogglePin from "../../queries/messages/useTogglePin.ts";
import Emoji from "../Emoji/Emoji.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import AudioMessagePlayer from "../AudioMessagePlayer/AudioMessagePlayer.tsx";
import ForwardMessageModal from "../ForwardMessageModal/ForwardMessageModal.tsx";
import styles from './MessageBubble.module.scss'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

type MessageBubbleProps = {
    message: Message
    isOwn: boolean
    currentUserId: number | undefined
    isRead: boolean
    showSender: boolean
    showAvatar: boolean
    isGroupStart: boolean
    isGroupEnd: boolean
    isNewDay: boolean
    onReply: (message: Message) => void
    onEdit: (message: Message) => void
    onDelete: (message: Message) => void
    onReplyPreviewClick: (messageId: number) => void
}

const replyPreviewLabel = (replyTo: NonNullable<Message['replyTo']>) => {
    if (replyTo.isDeleted) return 'Message deleted'
    if (replyTo.type === 'image') return 'Photo'
    if (replyTo.type === 'file') return 'File'
    return replyTo.content ?? ''
}

const MessageBubble = memo(({message, isOwn, currentUserId, isRead, showSender, showAvatar, isGroupStart, isGroupEnd, isNewDay, onReply, onEdit, onDelete, onReplyPreviewClick}: MessageBubbleProps) => {
    const {mutate: toggleReaction} = useToggleReaction()
    const {mutate: togglePin} = useTogglePin()
    const [pickerOpen, setPickerOpen] = useState(false)
    const [lightboxMedia, setLightboxMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null)
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
    const [actionsOpen, setActionsOpen] = useState(false)
    const inlineVideoRefs = useRef(new Map<number, HTMLVideoElement>())
    const rowRef = useRef<HTMLDivElement>(null)

    const openVideoLightbox = (attachmentId: number, url: string) => {
        inlineVideoRefs.current.get(attachmentId)?.pause()
        setLightboxMedia({url, type: 'video'})
    }

    useEffect(() => {
        if (!actionsOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
                setActionsOpen(false)
                setPickerOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [actionsOpen])

    useEscapeKey(() => {
        setPickerOpen(false)
        setActionsOpen(false)
    }, pickerOpen || actionsOpen)

    const handleBubbleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button, a, video, img')) return
        setActionsOpen((prev) => {
            if (prev) setPickerOpen(false)
            return !prev
        })
    }

    if (message.type === 'system') {
        return (
            <div className={styles.systemRow}>
                <span className={styles.systemBubble}>{message.content}</span>
            </div>
        )
    }

    const isDeleted = !!message.deletedAt
    const isPinned = !!message.pinnedAt
    const senderLabel = message.sender?.name || message.sender?.username || 'Someone'
    const hasReactions = !isDeleted && message.reactions.length > 0

    const handleTogglePin = () => {
        togglePin({chatId: message.chatId, messageId: message.id, pinned: !isPinned})
    }

    const handleReactionClick = (emoji: string) => {
        const reaction = message.reactions.find((r) => r.emoji === emoji)
        const reactedByMe = !!reaction && !!currentUserId && reaction.userIds.includes(currentUserId)
        toggleReaction({chatId: message.chatId, messageId: message.id, emoji, remove: reactedByMe})
    }

    const handlePickReaction = (emoji: string) => {
        toggleReaction({chatId: message.chatId, messageId: message.id, emoji, remove: false})
        setPickerOpen(false)
        setActionsOpen(false)
    }

    const renderAttachment = (attachment: Attachment) => {
        if (message.type === 'image') {
            return (
                <button
                    key={attachment.id}
                    type="button"
                    className={styles.imageAttachment}
                    onClick={() => setLightboxMedia({url: attachment.url, type: 'image'})}
                >
                    <img src={attachment.url} alt="Image" className={styles.imageAttachmentImg}/>
                </button>
            )
        }

        if (attachment.mimeType.startsWith('video/')) {
            return (
                <div key={attachment.id} className={styles.videoAttachmentWrapper}>
                    <video
                        ref={(el) => {
                            if (el) inlineVideoRefs.current.set(attachment.id, el)
                            else inlineVideoRefs.current.delete(attachment.id)
                        }}
                        src={attachment.url}
                        controls
                        className={styles.videoAttachment}
                    />
                    <button
                        type="button"
                        className={styles.videoExpandButton}
                        onClick={() => openVideoLightbox(attachment.id, attachment.url)}
                        title="Fullscreen"
                    >
                        <Maximize2 size={14}/>
                    </button>
                </div>
            )
        }

        if (attachment.mimeType.startsWith('audio/')) {
            return (
                <AudioMessagePlayer
                    key={attachment.id}
                    src={attachment.url}
                    duration={attachment.duration}
                    className={styles.audioAttachment}
                    label={attachment.mimeType === 'audio/webm' ? 'Voice message' : getFileName(attachment.url)}
                />
            )
        }

        return (
            <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className={styles.fileAttachment}
                onClick={(e) => {
                    e.preventDefault()
                    void downloadFile(attachment.url, getFileName(attachment.url))
                }}
            >
                <span className={styles.fileAttachmentIcon}>
                    <FileIcon size={20}/>
                </span>
                <span className={styles.fileAttachmentInfo}>
                    <span className={styles.fileAttachmentName}>{getFileName(attachment.url)}</span>
                    <span className={styles.fileAttachmentMeta}>{getFileExtension(attachment.url)} · {formatFileSize(attachment.size)}</span>
                </span>
                <Download size={16} className={styles.fileAttachmentDownload}/>
            </a>
        )
    }

    return (
        <div ref={rowRef} id={`message-${message.id}`} className={`${styles.row} ${isOwn ? styles.rowOwn : ''} ${isGroupStart ? styles.groupStart : ''} ${isNewDay ? styles.noTopMargin : ''}`}>
            {!isOwn && (
                <div className={styles.avatarSlot}>
                    {showAvatar && (
                        <Avatar avatarUrl={message.sender?.avatarUrl} color={message.sender?.avatarColor} seed={senderLabel} className={styles.avatar}/>
                    )}
                </div>
            )}

            <div className={styles.column}>
                <div
                    className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ''} ${isDeleted ? styles.bubbleDeleted : ''} ${isGroupEnd ? styles.groupEnd : ''}`}
                    onClick={handleBubbleClick}
                >
                    {message.forwardedFromSenderName && (
                        <span className={styles.forwardHeader}>Forwarded from {message.forwardedFromSenderName}</span>
                    )}

                    {!isOwn && showSender && <span className={styles.senderName}>{senderLabel}</span>}

                    {message.replyTo && (
                        <button
                            type="button"
                            className={styles.replyQuote}
                            onClick={() => onReplyPreviewClick(message.replyTo!.id)}
                        >
                            <span className={styles.replyQuoteSender}>
                                {message.replyTo.isDeleted ? 'Deleted' : (message.replyTo.sender?.name || message.replyTo.sender?.username || 'Someone')}
                            </span>
                            <span className={styles.replyQuoteText}>{replyPreviewLabel(message.replyTo)}</span>
                        </button>
                    )}

                    {!isDeleted && message.attachments.length > 0 && (
                        <div className={styles.attachments}>
                            {message.attachments.map(renderAttachment)}
                        </div>
                    )}

                    {isDeleted ? (
                        <span className={styles.deletedText}>Message deleted</span>
                    ) : message.content ? (
                        <span className={styles.text} dangerouslySetInnerHTML={{__html: renderMessageTextHtml(message.content)}}/>
                    ) : null}

                    {hasReactions ? (
                        <div className={styles.footer}>
                            <div className={styles.reactions}>
                                {message.reactions.map((reaction) => {
                                    const reactedByMe = !!currentUserId && reaction.userIds.includes(currentUserId)
                                    return (
                                        <button
                                            key={reaction.emoji}
                                            type="button"
                                            className={`${styles.reactionChip} ${reactedByMe ? styles.reactionChipActive : ''}`}
                                            onClick={() => handleReactionClick(reaction.emoji)}
                                        >
                                            <Emoji emoji={reaction.emoji} size={18}/>
                                            {reaction.count}
                                        </button>
                                    )
                                })}
                            </div>
                            <span className={styles.time}>
                                {isPinned && !isDeleted && <Pin size={11} className={styles.pinnedIcon} aria-label="Pinned"/>}
                                {formatMessageTime(message.createdAt)}
                                {message.editedAt && !isDeleted && <span className={styles.edited}> · edited</span>}
                                {isOwn && !isDeleted && (
                                    isRead
                                        ? <CheckCheck size={13} className={styles.readReceipt}/>
                                        : <Check size={13} className={styles.readReceipt}/>
                                )}
                            </span>
                        </div>
                    ) : (
                        <span className={`${styles.time} ${styles.timeFloat}`}>
                            {isPinned && !isDeleted && <Pin size={11} className={styles.pinnedIcon} aria-label="Pinned"/>}
                            {formatMessageTime(message.createdAt)}
                            {message.editedAt && !isDeleted && <span className={styles.edited}> · edited</span>}
                            {isOwn && !isDeleted && (
                                isRead
                                    ? <CheckCheck size={13} className={styles.readReceipt}/>
                                    : <Check size={13} className={styles.readReceipt}/>
                            )}
                        </span>
                    )}
                </div>

                {!isDeleted && (
                    <div className={`${styles.actions} ${actionsOpen ? styles.actionsVisible : ''}`}>
                        <div className={styles.reactionPickerWrapper}>
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={() => setPickerOpen((prev) => !prev)}
                                title="React"
                            >
                                <Smile size={18}/>
                            </button>
                            {pickerOpen && (
                                <>
                                    <div className={styles.pickerBackdrop} onClick={() => setPickerOpen(false)}/>
                                    <div className={styles.reactionPicker}>
                                        {QUICK_REACTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className={styles.reactionPickerItem}
                                                onClick={() => handlePickReaction(emoji)}
                                            >
                                                <Emoji emoji={emoji} size={26}/>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button type="button" className={styles.actionButton} onClick={() => {onReply(message); setActionsOpen(false)}} title="Reply">
                            <Reply size={18}/>
                        </button>
                        <button type="button" className={styles.actionButton} onClick={() => {setForwardingMessage(message); setActionsOpen(false)}} title="Forward">
                            <Forward size={18}/>
                        </button>
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => {handleTogglePin(); setActionsOpen(false)}}
                            title={isPinned ? 'Unpin' : 'Pin'}
                        >
                            {isPinned ? <PinOff size={18}/> : <Pin size={18}/>}
                        </button>
                        {isOwn && (
                            <>
                                <button type="button" className={styles.actionButton} onClick={() => {onEdit(message); setActionsOpen(false)}} title="Edit">
                                    <Pencil size={18}/>
                                </button>
                                <button type="button" className={styles.actionButton} onClick={() => {onDelete(message); setActionsOpen(false)}} title="Delete">
                                    <Trash2 size={18}/>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {lightboxMedia && (
                <Dialog.Root open onOpenChange={(open) => !open && setLightboxMedia(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className={styles.lightboxOverlay}/>
                        <Dialog.Content className={styles.lightboxContent} aria-describedby={undefined}>
                            <Dialog.Title className={styles.srOnly}>
                                {lightboxMedia.type === 'video' ? 'Video preview' : 'Image preview'}
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button type="button" className={styles.lightboxClose} title="Close">
                                    <X size={22}/>
                                </button>
                            </Dialog.Close>
                            {lightboxMedia.type === 'video' ? (
                                <video src={lightboxMedia.url} controls autoPlay className={styles.lightboxVideo}/>
                            ) : (
                                <img src={lightboxMedia.url} alt="Image" className={styles.lightboxImage}/>
                            )}
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            )}

            <ForwardMessageModal message={forwardingMessage} onOpenChange={(open) => !open && setForwardingMessage(null)}/>
        </div>
    )
})

export default MessageBubble
