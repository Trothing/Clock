import {useState} from "react";
import styles from './SearchedUsersList.module.scss'
import SearchedUserListItem from "../SearchedUserListItem/SearchedUserListItem.tsx";
import type {SearchedUser} from "../../types/user.type.ts";

type UserListProps = {
    users: SearchedUser[] | undefined
    isLoading: boolean
    isError: boolean
    onSelect: (user: SearchedUser) => void
    isSelecting?: boolean
}

const SearchedUsersList = ({users, isLoading, isError, onSelect, isSelecting}: UserListProps) => {
    const [pendingId, setPendingId] = useState<number | null>(null)

    const handleSelect = (user: SearchedUser) => {
        setPendingId(user.id)
        onSelect(user)
    }

    return (
        <div className={styles.list}>
            {isLoading && <div className={styles.state}>Searching...</div>}
            {isError && <div className={styles.state}>Failed to search</div>}

            {!isLoading && !isError && users?.length === 0 && (
                <div className={styles.empty}>
                    <p>No one found</p>
                </div>
            )}

            {!isLoading && !isError && users && users.length > 0 && (
                <div className={styles.items}>
                    {users.map((user) => (
                        <SearchedUserListItem
                            key={user.id}
                            user={user}
                            onSelect={handleSelect}
                            disabled={isSelecting}
                            isPending={!!isSelecting && pendingId === user.id}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchedUsersList
