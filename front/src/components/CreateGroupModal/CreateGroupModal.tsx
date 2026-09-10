import {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {Camera, Users, X} from "lucide-react";
import {createChatSchema} from "../../types/chats.type.ts";
import type {SearchedUser} from "../../types/user.type.ts";
import useCreateChat from "../../queries/chats/useCreateChat.ts";
import useSearchedUsers from "../../queries/users/useSearchedUsers.ts";
import useUploadFile from "../../queries/uploads/useUploadFile.ts";
import useDebouncedValue from "../../hooks/useDebouncedValue.ts";
import {getErrorMessage} from "../../utils/error.ts";
import Modal from "../Modal/Modal.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import formStyles from '../../pages/auth/authForm.module.scss'
import styles from './CreateGroupModal.module.scss'

type CreateGroupModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CreateGroupModal = ({open, onOpenChange}: CreateGroupModalProps) => {
    const [name, setName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [search, setSearch] = useState('')
    const [members, setMembers] = useState<SearchedUser[]>([])
    const [error, setError] = useState<string | null>(null)
    const [skippedWarning, setSkippedWarning] = useState<{chatId: number, names: string[]} | null>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const debouncedSearch = useDebouncedValue(search)
    const {data: searchedUsers} = useSearchedUsers(debouncedSearch)
    const {mutate: createChat, isPending} = useCreateChat()
    const {mutate: uploadAvatar, isPending: isUploadingAvatar} = useUploadFile('avatar')
    const navigate = useNavigate()

    const availableUsers = (searchedUsers ?? []).filter(
        (user) => !members.some((member) => member.id === user.id)
    )

    const reset = () => {
        setName('')
        setAvatarUrl('')
        setSearch('')
        setMembers([])
        setError(null)
        setSkippedWarning(null)
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
    }

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        uploadAvatar(file, {
            onSuccess: ({url}) => setAvatarUrl(url),
            onError: (err) => setError(getErrorMessage(err, 'Failed to upload avatar')),
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Please provide a group name")
            return
        }

        const result = createChatSchema.safeParse({
            type: 'group',
            name: name.trim(),
            avatarUrl: avatarUrl.trim() || undefined,
            memberIds: members.map((member) => member.id),
        })

        if (!result.success) {
            setError(z.prettifyError(result.error))
            return
        }

        createChat(result.data, {
            onSuccess: ({chat, skippedMemberIds}) => {
                if (skippedMemberIds.length > 0) {
                    const names = members
                        .filter((member) => skippedMemberIds.includes(member.id))
                        .map((member) => member.name || member.username)
                    setSkippedWarning({chatId: chat.id, names})
                    return
                }
                handleOpenChange(false)
                navigate(`/chats/${chat.id}`)
            },
            onError: (err) => setError(getErrorMessage(err, 'Failed to create group'))
        })
    }

    const handleDismissSkippedWarning = () => {
        if (!skippedWarning) return
        const chatId = skippedWarning.chatId
        handleOpenChange(false)
        navigate(`/chats/${chatId}`)
    }

    if (skippedWarning) {
        return (
            <Modal open={open} onOpenChange={handleOpenChange} title="New group">
                <div className={`${formStyles.form} ${styles.form}`}>
                    <p className={formStyles.label}>
                        Group created, but failed to add: {skippedWarning.names.join(', ')} - these users have restricted who can add them to groups.
                    </p>
                    <button type="button" className={formStyles.submitButton} onClick={handleDismissSkippedWarning}>
                        OK
                    </button>
                </div>
            </Modal>
        )
    }

    return (
        <Modal open={open} onOpenChange={handleOpenChange} title="New group">
            <form onSubmit={handleSubmit} className={`${formStyles.form} ${styles.form}`}>
                <div className={formStyles.field}>
                    <label htmlFor="group-name" className={formStyles.label}>Group name</label>
                    <div className={formStyles.inputWrapper}>
                        <Users size={16} className={formStyles.inputIcon}/>
                        <input
                            id="group-name"
                            type="text"
                            className={formStyles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="E.g., Friends"
                        />
                    </div>
                </div>

                <div className={styles.avatarField}>
                    <button type="button" className={styles.avatarPickButton} onClick={() => avatarInputRef.current?.click()}>
                        {avatarUrl
                            ? <Avatar avatarUrl={avatarUrl} seed={name || 'Group'} className={styles.avatarPreview}/>
                            : <Camera size={20}/>}
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={styles.hiddenFileInput}
                        onChange={handleAvatarFileChange}
                    />
                    <span className={formStyles.label}>
                        {isUploadingAvatar ? 'Uploading...' : 'Group avatar (optional)'}
                    </span>
                </div>

                <div className={formStyles.field}>
                    <label className={formStyles.label}>Members</label>

                    {members.length > 0 && (
                        <div className={styles.chips}>
                            {members.map((member) => (
                                <span key={member.id} className={styles.chip}>
                                    {member.name || member.username}
                                    <button
                                        type="button"
                                        className={styles.chipRemove}
                                        onClick={() => setMembers((old) => old.filter((m) => m.id !== member.id))}
                                    >
                                        <X size={16}/>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <input
                        type="text"
                        className={formStyles.input}
                        style={{paddingLeft: 12}}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search people by username..."
                    />

                    {search.length > 0 && availableUsers.length > 0 && (
                        <div className={styles.searchResults}>
                            {availableUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    className={styles.searchResultRow}
                                    onClick={() => {
                                        setMembers((old) => [...old, user])
                                        setSearch('')
                                    }}
                                >
                                    <Avatar avatarUrl={user.avatarUrl} color={user.avatarColor} seed={user.name || user.username} className={styles.searchResultAvatar}/>
                                    <span className={styles.searchResultName}>{user.name || user.username}</span>
                                    <span className={styles.searchResultUsername}>@{user.username}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className={formStyles.error}>{error}</p>}

                <button type="submit" className={formStyles.submitButton} disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create group'}
                </button>
            </form>
        </Modal>
    )
}

export default CreateGroupModal
