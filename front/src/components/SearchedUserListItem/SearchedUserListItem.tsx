import {Loader2} from "lucide-react";
import Avatar from "../Avatar/Avatar.tsx";
import useContacts from "../../queries/contacts/useContacts.ts";
import styles from './SearchedUserListItem.module.scss'
import type {SearchedUser} from "../../types/user.type.ts";

type UserListItemProps = {
    user: SearchedUser
    onSelect: (user: SearchedUser) => void
    disabled?: boolean
    isPending?: boolean
}

const SearchedUserListItem = ({user, onSelect, disabled, isPending}: UserListItemProps) => {
    const name = user.name
    const username = user.username
    const {data: contacts} = useContacts()
    const isContact = !!contacts?.some((c) => c.user.id === user.id)

    return (
        <button
            type="button"
            className={styles.row}
            onClick={() => onSelect(user)}
            disabled={disabled}
        >
            <Avatar avatarUrl={user.avatarUrl} color={user.avatarColor} seed={name || username} className={styles.avatar}/>
            <div className={styles.info}>
                {name && <span className={styles.name}>{name}</span>}
                <span className={styles.username}>@{username}</span>
            </div>
            {isPending
                ? <Loader2 size={16} className={styles.pendingIcon}/>
                : isContact && <span className={styles.contactBadge}>In contacts</span>}
        </button>
    )
}

export default SearchedUserListItem
