import {useEffect, useState} from "react";
import {Bookmark, Check} from "lucide-react";
import type {Message} from "../../types/messages.type.ts";
import useChats from "../../queries/chats/useChats.ts";
import useForwardMessage from "../../queries/messages/useForwardMessage.ts";
import {getChatAvatarColor, getChatAvatarUrl, getChatTitle, isSavedChat} from "../../utils/chatTitle.ts";
import Modal from "../Modal/Modal.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import styles from './ForwardMessageModal.module.scss'

type ForwardMessageModalProps = {
    message: Message | null
    onOpenChange: (open: boolean) => void
}

const ForwardMessageModal = ({message, onOpenChange}: ForwardMessageModalProps) => {
    const {data: chats} = useChats()
    const {mutate: forwardMessage, isPending} = useForwardMessage()
    const [sentToId, setSentToId] = useState<number | null>(null)

    useEffect(() => {
        if (message) setSentToId(null)
    }, [message])

    const handleForward = (chatId: number) => {
        if (!message) return
        forwardMessage({targetChatId: chatId, message}, {
            onSuccess: () => setSentToId(chatId),
        })
    }

    return (
        <Modal open={!!message} onOpenChange={onOpenChange} title="Forward message">
            <div className={styles.list}>
                {(chats ?? []).length === 0 && <div className={styles.empty}>No chats to forward to</div>}
                {(chats ?? []).map((chat) => {
                    const title = getChatTitle(chat)
                    const isSent = sentToId === chat.id
                    return (
                        <button
                            key={chat.id}
                            type="button"
                            className={styles.row}
                            onClick={() => handleForward(chat.id)}
                            disabled={isPending || isSent}
                        >
                            {isSavedChat(chat) ? (
                                <div className={styles.avatar} style={{background: 'var(--color-accent)'}}>
                                    <Bookmark size={18} color="var(--color-on-accent)"/>
                                </div>
                            ) : (
                                <Avatar avatarUrl={getChatAvatarUrl(chat)} color={getChatAvatarColor(chat)} seed={title} className={styles.avatar}/>
                            )}
                            <span className={styles.name}>{title}</span>
                            {isSent && <Check size={16} className={styles.sentIcon}/>}
                        </button>
                    )
                })}
            </div>
        </Modal>
    )
}

export default ForwardMessageModal
