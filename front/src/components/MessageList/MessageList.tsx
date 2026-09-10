import {useCallback, useLayoutEffect, useMemo, useRef} from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import type {Message} from "../../types/messages.type.ts";
import MessageBubble from "../MessageBubble/MessageBubble.tsx";
import bubbleStyles from '../MessageBubble/MessageBubble.module.scss'
import {formatDateLabel} from "../../utils/formatTime.ts";
import styles from './MessageList.module.scss'

type MessageListProps = {
    messages: Message[]
    currentUserId: number | undefined
    isGroup?: boolean
    otherUserLastReadMessageId?: number | null
    isLoading?: boolean
    hasOlderMessages?: boolean
    isLoadingOlderMessages?: boolean
    onLoadOlderMessages?: () => void
    onReply: (message: Message) => void
    onEdit: (message: Message) => void
    onDelete: (message: Message) => void
}

const NEAR_TOP_THRESHOLD = 100
const NEAR_BOTTOM_THRESHOLD = 200
const ESTIMATED_ROW_HEIGHT = 68

const MessageList = ({
    messages = [],
    currentUserId,
    isGroup = false,
    otherUserLastReadMessageId = null,
    isLoading,
    hasOlderMessages,
    isLoadingOlderMessages,
    onLoadOlderMessages,
    onReply,
    onEdit,
    onDelete,
}: MessageListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const prevFirstIdRef = useRef<number | null>(null)
    const prevLastIdRef = useRef<number | null>(null)
    const pendingOlderScrollHeightRef = useRef<number | null>(null)

    const rowMeta = useMemo(() => messages.map((message, index) => {
        const previous = messages[index - 1]
        const next = messages[index + 1]
        const isOwn = message.senderId === currentUserId
        const isNewDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString()
        const isGroupStart = isNewDay || previous.senderId !== message.senderId
            || previous.type === 'system' || message.type === 'system'
        const isGroupEnd = !next || next.senderId !== message.senderId || next.type === 'system'
            || new Date(next.createdAt).toDateString() !== new Date(message.createdAt).toDateString()
        return {
            isOwn,
            isNewDay,
            isGroupStart,
            isGroupEnd,
            showSender: isGroup && !isOwn && isGroupStart,
            showAvatar: !isOwn && isGroupEnd,
        }
    }), [messages, currentUserId, isGroup])

    const messageIndexById = useMemo(() => {
        const map = new Map<number, number>()
        messages.forEach((message, index) => map.set(message.id, index))
        return map
    }, [messages])

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ESTIMATED_ROW_HEIGHT,
        overscan: 8,
    })

    useLayoutEffect(() => {
        const container = scrollRef.current
        if (!container || messages.length === 0) return

        const firstId = messages[0].id
        const lastId = messages[messages.length - 1].id

        if (prevFirstIdRef.current === null) {
            container.scrollTop = container.scrollHeight
            let attempts = 0
            let lastHeight = container.scrollHeight
            const settle = () => {
                attempts++
                container.scrollTop = container.scrollHeight
                if (container.scrollHeight !== lastHeight && attempts < 20) {
                    lastHeight = container.scrollHeight
                    requestAnimationFrame(settle)
                }
            }
            requestAnimationFrame(settle)
        } else if (pendingOlderScrollHeightRef.current !== null) {
            const before = pendingOlderScrollHeightRef.current
            requestAnimationFrame(() => {
                rowVirtualizer.measure()
                container.scrollTop += container.scrollHeight - before
                pendingOlderScrollHeightRef.current = null
            })
        } else if (lastId !== prevLastIdRef.current) {
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
            if (distanceFromBottom < NEAR_BOTTOM_THRESHOLD) {
                container.scrollTop = container.scrollHeight
            }
        }

        prevFirstIdRef.current = firstId
        prevLastIdRef.current = lastId
    }, [messages, rowVirtualizer])

    const handleLoadOlder = useCallback(() => {
        if (!onLoadOlderMessages || isLoadingOlderMessages) return
        const container = scrollRef.current
        pendingOlderScrollHeightRef.current = container?.scrollHeight ?? null
        onLoadOlderMessages()
    }, [onLoadOlderMessages, isLoadingOlderMessages])

    const handleScroll = useCallback(() => {
        const container = scrollRef.current
        if (!container || !hasOlderMessages || isLoadingOlderMessages) return
        if (container.scrollTop < NEAR_TOP_THRESHOLD) {
            handleLoadOlder()
        }
    }, [hasOlderMessages, isLoadingOlderMessages, handleLoadOlder])

    const handleReplyPreviewClick = useCallback((messageId: number) => {
        const targetIndex = messageIndexById.get(messageId)
        if (targetIndex === undefined) return

        requestAnimationFrame(() => {
            rowVirtualizer.scrollToIndex(targetIndex, {align: 'center'})

            requestAnimationFrame(() => {
                const el = document.getElementById(`message-${messageId}`)
                if (!el) return
                el.classList.add(bubbleStyles.highlight)
                setTimeout(() => el.classList.remove(bubbleStyles.highlight), 1200)
            })
        })
    }, [messageIndexById, rowVirtualizer])

    if (isLoading) {
        return <div className={styles.state}>Loading...</div>
    }

    if (messages.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No messages here yet</p>
                <span>Write the first message below</span>
            </div>
        )
    }

    return (
        <div className={styles.scrollContainer} ref={scrollRef} onScroll={handleScroll}>
            {hasOlderMessages && (
                <div className={styles.loadOlderWrapper}>
                    <button
                        type="button"
                        className={styles.loadOlderButton}
                        onClick={handleLoadOlder}
                        disabled={isLoadingOlderMessages}
                    >
                        {isLoadingOlderMessages ? 'Loading...' : 'Load older messages'}
                    </button>
                </div>
            )}
            <div className={styles.list} style={{height: rowVirtualizer.getTotalSize()}}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const message = messages[virtualRow.index]
                    const meta = rowMeta[virtualRow.index]

                    return (
                        <div
                            key={message.id}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            {meta.isNewDay && (
                                <div className={styles.dateSeparator}>
                                    <span>{formatDateLabel(message.createdAt)}</span>
                                </div>
                            )}
                            <MessageBubble
                                message={message}
                                isOwn={meta.isOwn}
                                currentUserId={currentUserId}
                                isRead={meta.isOwn && otherUserLastReadMessageId != null && message.id <= otherUserLastReadMessageId}
                                showSender={meta.showSender}
                                showAvatar={meta.showAvatar}
                                isGroupStart={meta.isGroupStart}
                                isGroupEnd={meta.isGroupEnd}
                                isNewDay={meta.isNewDay}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReplyPreviewClick={handleReplyPreviewClick}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MessageList
