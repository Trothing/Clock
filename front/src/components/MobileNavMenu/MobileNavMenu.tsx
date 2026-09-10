import {useState} from "react";
import {Archive, Bookmark, Menu, Settings, Users} from "lucide-react";
import type {User} from "../../types/user.type.ts";
import ProfileModal from "../ProfileModal/ProfileModal.tsx";
import ArchivedChatsModal from "../ArchivedChatsModal/ArchivedChatsModal.tsx";
import ContactsModal from "../ContactsModal/ContactsModal.tsx";
import SettingsModal from "../SettingsModal/SettingsModal.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import useNavModals from "../NavRail/useNavModals.ts";
import useEscapeKey from "../../hooks/useEscapeKey.ts";
import styles from './MobileNavMenu.module.scss'

type MobileNavMenuProps = {
    user: User
}

const MobileNavMenu = ({user}: MobileNavMenuProps) => {
    const [open, setOpen] = useState(false)
    const {
        profileOpen, setProfileOpen,
        archiveOpen, setArchiveOpen,
        contactsOpen, setContactsOpen,
        settingsOpen, setSettingsOpen,
        handleOpenSaved,
    } = useNavModals()

    useEscapeKey(() => setOpen(false), open)

    const items = [
        {icon: Archive, label: 'Archive', onClick: () => setArchiveOpen(true)},
        {icon: Users, label: 'Contacts', onClick: () => setContactsOpen(true)},
        {icon: Bookmark, label: 'Saved', onClick: handleOpenSaved},
        {icon: Settings, label: 'Options', onClick: () => setSettingsOpen(true)},
    ]

    return (
        <div className={styles.wrapper}>
            <button type="button" className={styles.trigger} onClick={() => setOpen((prev) => !prev)} title="Menu">
                <Menu size={19}/>
            </button>

            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)}/>
                    <div className={styles.dropdown}>
                        <button
                            type="button"
                            className={styles.profileRow}
                            onClick={() => {
                                setProfileOpen(true)
                                setOpen(false)
                            }}
                        >
                            <Avatar avatarUrl={user.avatarUrl} color={user.avatarColor} seed={user.username} className={styles.profileAvatar}/>
                            <div className={styles.profileInfo}>
                                <span className={styles.profileName}>{user.name || user.username}</span>
                                <span className={styles.profileUsername}>@{user.username}</span>
                            </div>
                        </button>

                        {items.map(({icon: Icon, label, onClick}) => (
                            <button
                                key={label}
                                type="button"
                                className={styles.item}
                                onClick={() => {
                                    onClick()
                                    setOpen(false)
                                }}
                            >
                                <Icon size={16}/>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} user={user}/>
            <ArchivedChatsModal open={archiveOpen} onOpenChange={setArchiveOpen}/>
            <ContactsModal open={contactsOpen} onOpenChange={setContactsOpen}/>
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen}/>
        </div>
    )
}

export default MobileNavMenu
