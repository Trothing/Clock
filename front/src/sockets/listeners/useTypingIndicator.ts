import {useEffect, useRef, useState} from "react";
import {socket} from "../socket.ts";

const STOP_TYPING_DELAY = 3000

function useTypingIndicator(chatId: number) {
    const [typingUserIds, setTypingUserIds] = useState<number[]>([])
    const isTypingRef = useRef(false)
    const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => {
        setTypingUserIds([])

        const handleTypingUpdate = ({chatId: updatedChatId, userIds}: {chatId: number, userIds: number[]}) => {
            if (updatedChatId !== chatId) return
            setTypingUserIds(userIds)
        }

        socket.on('typing:update', handleTypingUpdate)

        return () => {
            socket.off('typing:update', handleTypingUpdate)
            if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)
            if (isTypingRef.current) {
                socket.emit('typing:stop', {chatId})
                isTypingRef.current = false
            }
        }
    }, [chatId])

    const notifyTyping = () => {
        if (!isTypingRef.current) {
            socket.emit('typing:start', {chatId})
            isTypingRef.current = true
        }

        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)
        stopTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', {chatId})
            isTypingRef.current = false
        }, STOP_TYPING_DELAY)
    }

    const notifyStoppedTyping = () => {
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)
        if (isTypingRef.current) {
            socket.emit('typing:stop', {chatId})
            isTypingRef.current = false
        }
    }

    return {typingUserIds, notifyTyping, notifyStoppedTyping}
}

export default useTypingIndicator
