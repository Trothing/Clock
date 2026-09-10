import {useRef, useState} from "react";
import {Ban, Bell, Bookmark, Camera, Download, File, Image, Link2, Mic, Pencil, Shield, UserMinus, UserPlus, X} from "lucide-react";
import type {Chat} from "../../types/chats.type.ts";
import {getChatAvatarColor, getChatAvatarUrl, getChatTitle, isSavedChat} from "../../utils/chatTitle.ts";
import {getErrorMessage} from "../../utils/error.ts";
import {formatFileSize, getFileExtension, getFileName} from "../../utils/fileFormat.ts";
import {downloadFile} from "../../utils/download.ts";
import {formatMessageTime} from "../../utils/formatTime.ts";
import Avatar from "../Avatar/Avatar.tsx";
import AudioMessagePlayer from "../AudioMessagePlayer/AudioMessagePlayer.tsx";
import useUpdateChatSettings from "../../queries/chats/useUpdateChatSettings.ts";
import useUpdateChat from "../../queries/chats/useUpdateChat.ts";
import useUploadFile from "../../queries/uploads/useUploadFile.ts";
import useBlockedUsers from "../../queries/blockedUsers/useBlockedUsers.ts";
import useBlockUser from "../../queries/blockedUsers/useBlockUser.ts";
import useUnblockUser from "../../queries/blockedUsers/useUnblockUser.ts";
import useContacts from "../../queries/contacts/useContacts.ts";
import useAddContact from "../../queries/contacts/useAddContact.ts";
import useRemoveContact from "../../queries/contacts/useRemoveContact.ts";
import useChatAttachments from "../../queries/messages/useChatAttachments.ts";
import useChatLinks from "../../queries/messages/useChatLinks.ts";
import useChatMembers from "../../queries/chats/useChatMembers.ts";
import useReportChat from "../../queries/chats/useReportChat.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import {useConfirmDialog} from "../../providers/ConfirmDialogProvider.tsx";
import styles from './ChatInfoPanel.module.scss'

const URL_REGEX = /https?:\/\/\S+/g

type ChatInfoPanelProps = {
    chat: Chat
    onClose: () => void
}

const TABS = [
    {id: 'media', label: 'Media', icon: Image, empty: 'No shared photos or videos'},
    {id: 'files', label: 'Files', icon: File, empty: 'No shared files'},
    {id: 'links', label: 'Links', icon: Link2, empty: 'No shared links'},
    {id: 'voice', label: 'Voice', icon: Mic, empty: 'No voice messages'},
] as const

const ChatInfoPanel = ({chat, onClose}: ChatInfoPanelProps) => {
    const currentUserId = useAuthStore((state) => state.user?.id)
    const {confirm} = useConfirmDialog()
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('media')
    const {mutate: updateSettings} = useUpdateChatSettings()
    const {mutate: updateChat, isPending: isSavingGroup} = useUpdateChat()
    const {mutate: uploadAvatar, isPending: isUploadingGroupAvatar} = useUploadFile('avatar')
    const {data: blockedUsers} = useBlockedUsers()
    const {mutate: blockUser, isPending: isBlockPending} = useBlockUser()
    const {mutate: unblockUser, isPending: isUnblockPending} = useUnblockUser()
    const {data: contacts} = useContacts()
    const {mutate: addContact, isPending: isAddContactPending} = useAddContact()
    const {mutate: removeContact, isPending: isRemoveContactPending} = useRemoveContact()
    const {mutate: reportChat, isPending: isReportPending} = useReportChat()
    const [actionError, setActionError] = useState<string | null>(null)
    const {data: mediaAttachments, isLoading: mediaLoading} = useChatAttachments(chat.id, 'media', activeTab === 'media')
    const {data: fileAttachments, isLoading: filesLoading} = useChatAttachments(chat.id, 'files', activeTab === 'files')
    const {data: voiceAttachments, isLoading: voiceLoading} = useChatAttachments(chat.id, 'voice', activeTab === 'voice')
    const {data: linkMessages, isLoading: linksLoading} = useChatLinks(chat.id, activeTab === 'links')
    const {data: members} = useChatMembers(chat.id, chat.type === 'group')
    const groupAvatarInputRef = useRef<HTMLInputElement>(null)

    const [isEditingGroup, setIsEditingGroup] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [groupError, setGroupError] = useState<string | null>(null)

    const title = getChatTitle(chat)
    const isSaved = isSavedChat(chat)
    const notificationsOn = !chat.settings.isMuted
    const activeTabData = TABS.find((tab) => tab.id === activeTab)!
    const otherUserId = chat.otherUser?.id
    const isBlocked = !!otherUserId && !!blockedUsers?.some((b) => b.user.id === otherUserId)
    const isContact = !!otherUserId && !!contacts?.some((c) => c.user.id === otherUserId)

    const handleToggleBlock = async () => {
        if (!otherUserId) return
        setActionError(null)
        if (isBlocked) {
            unblockUser(otherUserId, {onError: (err) => setActionError(getErrorMessage(err, 'Failed to unblock user'))})
            return
        }
        const ok = await confirm({
            message: `Block ${title}? You will no longer receive messages from this user.`,
            confirmLabel: 'Block',
            danger: true,
        })
        if (!ok) return
        blockUser(otherUserId, {onError: (err) => setActionError(getErrorMessage(err, 'Failed to block user'))})
    }

    const handleToggleContact = async () => {
        if (!otherUserId) return
        setActionError(null)
        if (isContact) {
            const ok = await confirm({message: `Remove ${title} from contacts?`, confirmLabel: 'Remove', danger: true})
            if (!ok) return
            removeContact(otherUserId, {onError: (err) => setActionError(getErrorMessage(err, 'Failed to remove from contacts'))})
            return
        }
        addContact(otherUserId, {onError: (err) => setActionError(getErrorMessage(err, 'Failed to add to contacts'))})
    }

    const handleReport = async () => {
        const ok = await confirm({
            message: `Send a report on this ${chat.type === 'group' ? 'group chat' : 'chat'}?`,
            confirmLabel: 'Send',
        })
        if (!ok) return
        setActionError(null)
        reportChat({chatId: chat.id}, {
            onSuccess: () => confirm({message: 'Report sent', cancelLabel: null}),
            onError: (err) => setActionError(getErrorMessage(err, 'Failed to send report')),
        })
    }

    const startEditingGroup = () => {
        setGroupName(chat.name ?? '')
        setGroupError(null)
        setIsEditingGroup(true)
    }

    const handleGroupAvatarClick = () => {
        if (isEditingGroup) groupAvatarInputRef.current?.click()
    }

    const handleGroupAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        setGroupError(null)
        uploadAvatar(file, {
            onSuccess: ({url}) => updateChat({chatId: chat.id, data: {avatarUrl: url}}, {
                onSuccess: () => setGroupError(null),
                onError: (err) => setGroupError(getErrorMessage(err, 'Failed to update group avatar')),
            }),
            onError: (err) => setGroupError(getErrorMessage(err, 'Failed to upload avatar')),
        })
    }

    const handleGroupNameSave = (e: React.FormEvent) => {
        e.preventDefault()
        setGroupError(null)

        const name = groupName.trim()
        if (!name) {
            setGroupError('Group name cannot be empty')
            return
        }

        updateChat({chatId: chat.id, data: {name}}, {
            onSuccess: () => setIsEditingGroup(false),
            onError: (err) => setGroupError(getErrorMessage(err, 'Failed to update group')),
        })
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>Chat info</span>
                <button type="button" className={styles.closeButton} onClick={onClose} title="Close">
                    <X size={16}/>
                </button>
            </div>

            <div className={styles.profile}>
                <button
                    type="button"
                    className={styles.avatarButton}
                    onClick={handleGroupAvatarClick}
                    disabled={!isEditingGroup}
                >
                    {isSaved ? (
                        <div className={styles.avatar} style={{background: 'var(--color-accent)'}}>
                            <Bookmark size={24} color="var(--color-on-accent)"/>
                        </div>
                    ) : (
                        <Avatar avatarUrl={getChatAvatarUrl(chat)} color={getChatAvatarColor(chat)} seed={title} className={styles.avatar}/>
                    )}
                    {isEditingGroup && (
                        <span className={styles.avatarOverlay}>
                            <Camera size={16}/>
                        </span>
                    )}
                </button>
                {chat.type === 'group' && (
                    <input
                        ref={groupAvatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className={styles.hiddenFileInput}
                        onChange={handleGroupAvatarChange}
                    />
                )}
                {isUploadingGroupAvatar && <span className={styles.bio}>Uploading avatar...</span>}

                {isEditingGroup ? (
                    <form onSubmit={handleGroupNameSave} className={styles.groupNameForm}>
                        <input
                            type="text"
                            className={styles.groupNameInput}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            autoFocus
                        />
                        {groupError && <span className={styles.groupError}>{groupError}</span>}
                        <div className={styles.groupEditActions}>
                            <button type="button" className={styles.groupCancelButton} onClick={() => setIsEditingGroup(false)}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.groupSaveButton} disabled={isSavingGroup}>
                                {isSavingGroup ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <span className={styles.name}>{title}</span>
                        <span className={styles.bio}>
                            {isSaved ? 'Chat with yourself' : chat.type === 'group' ? `${members?.length ?? 0} members` : 'No description'}
                        </span>
                        {isContact && <span className={styles.contactBadge}>In contacts</span>}
                        {isBlocked && <span className={styles.blockedBadge}>Blocked</span>}
                        {chat.type === 'group' && (
                            <button type="button" className={styles.editGroupButton} onClick={startEditingGroup}>
                                <Pencil size={13}/>
                                Edit group
                            </button>
                        )}
                        {groupError && <span className={styles.groupError}>{groupError}</span>}
                    </>
                )}
            </div>

            <button
                type="button"
                className={styles.toggleRow}
                onClick={() => updateSettings({chatId: chat.id, data: {isMuted: notificationsOn}})}
            >
                <Bell size={15}/>
                <span>Notifications</span>
                <span className={`${styles.switch} ${notificationsOn ? styles.switchOn : ''}`}>
                    <span className={styles.switchKnob}/>
                </span>
            </button>

            {chat.type === 'group' && (
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Members - {members?.length ?? 0}</span>
                    {members?.map((member) => (
                        <div key={member.id} className={styles.memberRow}>
                            <Avatar avatarUrl={member.avatarUrl} color={member.avatarColor} seed={member.name || member.username} className={styles.memberAvatar}/>
                            <span className={styles.memberName}>{member.name || member.username}</span>
                            {member.id === currentUserId && <span className={styles.memberRole}>You</span>}
                            {member.role === 'admin' && <span className={styles.memberRole}>Admin</span>}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.tabs}>
                {TABS.map(({id, label, icon: Icon}) => (
                    <button
                        key={id}
                        type="button"
                        className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(id)}
                        title={label}
                    >
                        <Icon size={16}/>
                    </button>
                ))}
            </div>
            {activeTab === 'media' && (
                mediaLoading ? (
                    <div className={styles.tabContent}>Loading...</div>
                ) : !mediaAttachments || mediaAttachments.length === 0 ? (
                    <div className={styles.tabContent}>{activeTabData.empty}</div>
                ) : (
                    <div className={styles.mediaGrid}>
                        {mediaAttachments.map((attachment) => (
                            <button
                                key={attachment.id}
                                type="button"
                                className={styles.mediaThumb}
                                onClick={() => window.open(attachment.url, '_blank')}
                            >
                                {attachment.mimeType.startsWith('video/') ? (
                                    <video src={attachment.url} className={styles.mediaThumbImg}/>
                                ) : (
                                    <img src={attachment.url} alt="Media" className={styles.mediaThumbImg}/>
                                )}
                            </button>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'files' && (
                filesLoading ? (
                    <div className={styles.tabContent}>Loading...</div>
                ) : !fileAttachments || fileAttachments.length === 0 ? (
                    <div className={styles.tabContent}>{activeTabData.empty}</div>
                ) : (
                    <div className={styles.fileList}>
                        {fileAttachments.map((attachment) => (
                            <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.fileRow}
                                onClick={(e) => {
                                    e.preventDefault()
                                    void downloadFile(attachment.url, getFileName(attachment.url))
                                }}
                            >
                                <span className={styles.fileRowIcon}>
                                    <File size={18}/>
                                </span>
                                <span className={styles.fileRowInfo}>
                                    <span className={styles.fileRowName}>{getFileName(attachment.url)}</span>
                                    <span className={styles.fileRowMeta}>{getFileExtension(attachment.url)} · {formatFileSize(attachment.size)}</span>
                                </span>
                                <Download size={15} className={styles.fileRowDownload}/>
                            </a>
                        ))}
                    </div>
                )
            )}

            {activeTab === 'voice' && (
                voiceLoading ? (
                    <div className={styles.tabContent}>Loading...</div>
                ) : !voiceAttachments || voiceAttachments.length === 0 ? (
                    <div className={styles.tabContent}>{activeTabData.empty}</div>
                ) : (
                    <div className={styles.voiceList}>
                        {voiceAttachments.map((attachment) => (
                            <AudioMessagePlayer
                                key={attachment.id}
                                src={attachment.url}
                                duration={attachment.duration}
                                className={styles.voiceItem}
                                label={attachment.mimeType === 'audio/webm' ? 'Voice message' : getFileName(attachment.url)}
                            />
                        ))}
                    </div>
                )
            )}

            {activeTab === 'links' && (
                linksLoading ? (
                    <div className={styles.tabContent}>Loading...</div>
                ) : !linkMessages || linkMessages.length === 0 ? (
                    <div className={styles.tabContent}>{activeTabData.empty}</div>
                ) : (
                    <div className={styles.linkList}>
                        {linkMessages.map((message) => {
                            const urls = message.content?.match(URL_REGEX) ?? []
                            return (
                                <div key={message.id} className={styles.linkRow}>
                                    {urls.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.linkUrl}>{url}</a>
                                    ))}
                                    <span className={styles.linkMeta}>
                                        {message.sender?.name || message.sender?.username || 'Someone'} · {formatMessageTime(message.createdAt)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {!isSaved && (
                <div className={styles.section}>
                    {chat.type === 'direct' && (
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={handleToggleContact}
                            disabled={isAddContactPending || isRemoveContactPending}
                        >
                            {isContact ? <UserMinus size={15}/> : <UserPlus size={15}/>}
                            {isContact ? 'Remove from contacts' : 'Add to contacts'}
                        </button>
                    )}
                    {chat.type === 'direct' && (
                        <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={handleToggleBlock}
                            disabled={isBlockPending || isUnblockPending}
                        >
                            <Ban size={15}/>
                            {isBlocked ? 'Unblock' : 'Block'}
                        </button>
                    )}
                    {actionError && <span className={styles.groupError}>{actionError}</span>}
                    <button type="button" className={styles.dangerButton} onClick={handleReport} disabled={isReportPending}>
                        <Shield size={15}/>
                        Report
                    </button>
                </div>
            )}
        </div>
    )
}

export default ChatInfoPanel
