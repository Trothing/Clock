import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Search, UserMinus, X} from "lucide-react";
import Modal from "../Modal/Modal.tsx";
import SearchedUsersList from "../SearchedUsersList/SearchedUsersList.tsx";
import useContacts from "../../queries/contacts/useContacts.ts";
import useAddContact from "../../queries/contacts/useAddContact.ts";
import useRemoveContact from "../../queries/contacts/useRemoveContact.ts";
import useSearchedUsers from "../../queries/users/useSearchedUsers.ts";
import useCreateChat from "../../queries/chats/useCreateChat.ts";
import useDebouncedValue from "../../hooks/useDebouncedValue.ts";
import {useConfirmDialog} from "../../providers/ConfirmDialogProvider.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import type {SearchedUser} from "../../types/user.type.ts";
import {getErrorMessage} from "../../utils/error.ts";
import styles from './ContactsModal.module.scss'

type ContactsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ContactsModal = ({open, onOpenChange}: ContactsModalProps) => {
    const [search, setSearch] = useState('')
    const [error, setError] = useState<string | null>(null)
    const debouncedSearch = useDebouncedValue(search)
    const navigate = useNavigate()

    const {data: contacts, isLoading} = useContacts()
    const {mutate: addContact, isPending: isAdding} = useAddContact()
    const {mutate: removeContact, isPending: isRemoving} = useRemoveContact()
    const {data: searchedUsers, isLoading: searchLoading, isError: searchError} = useSearchedUsers(debouncedSearch)
    const {mutate: createChat, isPending: isStartingChat} = useCreateChat()
    const {confirm} = useConfirmDialog()

    const handleSelectUser = (user: SearchedUser) => {
        setError(null)
        addContact(user.id, {
            onSuccess: () => setSearch(''),
            onError: (err) => setError(getErrorMessage(err, 'Failed to add to contacts')),
        })
    }

    const handleOpenChat = (userId: number) => {
        setError(null)
        createChat({type: 'direct', memberIds: [userId]}, {
            onSuccess: ({chat}) => {
                onOpenChange(false)
                navigate(`/chats/${chat.id}`)
            },
            onError: (err) => setError(getErrorMessage(err, 'Failed to open chat')),
        })
    }

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Contacts">
            <div className={styles.body}>
                <div className={styles.searchWrapper}>
                    <Search size={15} className={styles.searchIcon}/>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Find and add by username"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search.length > 0 && (
                        <button type="button" className={styles.clearButton} onClick={() => setSearch('')} title="Clear">
                            <X size={14}/>
                        </button>
                    )}
                </div>

                {error && <div className={styles.state}>{error}</div>}

                {search.length > 0 ? (
                    <SearchedUsersList
                        users={searchedUsers}
                        isLoading={searchLoading}
                        isError={searchError}
                        onSelect={handleSelectUser}
                        isSelecting={isAdding}
                    />
                ) : (
                    <div className={styles.list}>
                        {isLoading && <div className={styles.state}>Loading...</div>}
                        {!isLoading && contacts?.length === 0 && (
                            <div className={styles.empty}>No contacts yet - find someone by username above</div>
                        )}
                        {contacts?.map((contact) => {
                            const title = contact.user.name || contact.user.username
                            return (
                                <div
                                    key={contact.id}
                                    className={styles.row}
                                    role="button"
                                    tabIndex={0}
                                    aria-disabled={isStartingChat}
                                    onClick={() => { if (!isStartingChat) handleOpenChat(contact.user.id) }}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && !isStartingChat) {
                                            e.preventDefault()
                                            handleOpenChat(contact.user.id)
                                        }
                                    }}
                                    title={`Message ${title}`}
                                >
                                    <Avatar avatarUrl={contact.user.avatarUrl} color={contact.user.avatarColor} seed={title} className={styles.avatar}/>
                                    <div className={styles.info}>
                                        <span className={styles.name}>{title}</span>
                                        <span className={styles.username}>@{contact.user.username}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        title="Remove from contacts"
                                        disabled={isRemoving}
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            const ok = await confirm({message: `Remove ${title} from contacts?`, confirmLabel: 'Remove', danger: true})
                                            if (!ok) return
                                            setError(null)
                                            removeContact(contact.user.id, {
                                                onError: (err) => setError(getErrorMessage(err, 'Failed to remove from contacts')),
                                            })
                                        }}
                                    >
                                        <UserMinus size={16}/>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default ContactsModal
