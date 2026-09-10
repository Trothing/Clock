import {useState} from "react";
import {ArchiveRestore, User, Users} from "lucide-react";
import {Link} from "react-router-dom";
import Modal from "../Modal/Modal.tsx";
import useChats from "../../queries/chats/useChats.ts";
import useUpdateChatSettings from "../../queries/chats/useUpdateChatSettings.ts";
import Avatar from "../Avatar/Avatar.tsx";
import {getChatAvatarColor, getChatAvatarUrl, getChatTitle} from "../../utils/chatTitle.ts";
import {getErrorMessage} from "../../utils/error.ts";
import styles from './ArchivedChatsModal.module.scss'

type ArchivedChatsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ArchivedChatsModal = ({open, onOpenChange}: ArchivedChatsModalProps) => {
    const {data: chats} = useChats()
    const {mutate: updateSettings, isPending} = useUpdateChatSettings()
    const [error, setError] = useState<string | null>(null)

    const archivedChats = chats?.filter((chat) => chat.settings.isArchived) ?? []

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Archive">
            <div className={styles.body}>
                {archivedChats.length === 0 && (
                    <div className={styles.empty}>No archived chats</div>
                )}
                {error && <div className={styles.empty}>{error}</div>}

                {archivedChats.map((chat) => {
                    const title = getChatTitle(chat)
                    const TypeIcon = chat.type === 'group' ? Users : User

                    return (
                        <div key={chat.id} className={styles.row}>
                            <Link to={`/chats/${chat.id}`} className={styles.rowLink} onClick={() => onOpenChange(false)}>
                                <Avatar avatarUrl={getChatAvatarUrl(chat)} color={getChatAvatarColor(chat)} seed={title} className={styles.avatar}/>
                                <span className={styles.name}>
                                    <TypeIcon size={13}/>
                                    {title}
                                </span>
                            </Link>
                            <button
                                type="button"
                                className={styles.unarchiveButton}
                                title="Unarchive"
                                disabled={isPending}
                                onClick={() => {
                                    setError(null)
                                    updateSettings({chatId: chat.id, data: {isArchived: false}}, {
                                        onError: (err) => setError(getErrorMessage(err, 'Failed to unarchive chat')),
                                    })
                                }}
                            >
                                <ArchiveRestore size={16}/>
                            </button>
                        </div>
                    )
                })}
            </div>
        </Modal>
    )
}

export default ArchivedChatsModal
