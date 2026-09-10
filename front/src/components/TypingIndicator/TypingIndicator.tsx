import type {Chat} from "../../types/chats.type.ts";
import styles from './TypingIndicator.module.scss'

type TypingIndicatorProps = {
    typingUserIds: number[]
    currentUserId: number | undefined
    chat: Chat
}

const TypingIndicator = ({typingUserIds, currentUserId, chat}: TypingIndicatorProps) => {
    const others = typingUserIds.filter((id) => id !== currentUserId)
    if (others.length === 0) return null

    const text = chat.type === 'direct'
        ? `${chat.otherUser?.name || chat.otherUser?.username || 'User'} is typing...`
        : others.length === 1 ? 'Someone is typing...' : `${others.length} people are typing...`

    return (
        <div className={styles.wrapper}>
            <span className={styles.dot}/>
            <span className={styles.dot}/>
            <span className={styles.dot}/>
            <span className={styles.text}>{text}</span>
        </div>
    )
}

export default TypingIndicator
