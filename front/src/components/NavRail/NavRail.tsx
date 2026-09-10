import {Link, useLocation} from "react-router-dom";
import {Archive, Bookmark, MessageCircle, Settings, Users} from "lucide-react";
import type {User} from "../../types/user.type.ts";
import ProfileModal from "../ProfileModal/ProfileModal.tsx";
import ArchivedChatsModal from "../ArchivedChatsModal/ArchivedChatsModal.tsx";
import ContactsModal from "../ContactsModal/ContactsModal.tsx";
import SettingsModal from "../SettingsModal/SettingsModal.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import useNavModals from "./useNavModals.ts";
import styles from './NavRail.module.scss'

type NavRailProps = {
    user: User
}

const NavRail = ({user}: NavRailProps) => {
    const location = useLocation()
    const isChatsActive = location.pathname === '/' || location.pathname.startsWith('/chats')
    const {
        profileOpen, setProfileOpen,
        archiveOpen, setArchiveOpen,
        contactsOpen, setContactsOpen,
        settingsOpen, setSettingsOpen,
        handleOpenSaved,
    } = useNavModals()

    return (
        <nav className={styles.navRail}>
            <Link to="/" className={`${styles.navItem} ${isChatsActive ? styles.navItemActive : ''}`}>
                <MessageCircle size={21} strokeWidth={2}/>
                <span className={styles.navLabel}>Chats</span>
            </Link>

            <button type="button" className={styles.navItem} onClick={() => setArchiveOpen(true)} title="Archive">
                <Archive size={21} strokeWidth={2}/>
                <span className={styles.navLabel}>Archive</span>
            </button>

            <button type="button" className={styles.navItem} onClick={() => setContactsOpen(true)} title="Contacts">
                <Users size={21} strokeWidth={2}/>
                <span className={styles.navLabel}>Contacts</span>
            </button>

            <button type="button" className={styles.navItem} onClick={handleOpenSaved} title="Saved">
                <Bookmark size={21} strokeWidth={2}/>
                <span className={styles.navLabel}>Saved</span>
            </button>

            <div className={styles.navRailSpacer}/>

            <button type="button" className={styles.navItem} onClick={() => setSettingsOpen(true)} title="Options">
                <Settings size={20} strokeWidth={2}/>
                <span className={styles.navLabel}>Options</span>
            </button>

            <button type="button" className={styles.avatar} title="Profile" onClick={() => setProfileOpen(true)}>
                <Avatar avatarUrl={user.avatarUrl} color={user.avatarColor} seed={user.username} className={styles.avatarFill}/>
            </button>

            <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} user={user}/>
            <ArchivedChatsModal open={archiveOpen} onOpenChange={setArchiveOpen}/>
            <ContactsModal open={contactsOpen} onOpenChange={setContactsOpen}/>
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen}/>
        </nav>
    )
}

export default NavRail
