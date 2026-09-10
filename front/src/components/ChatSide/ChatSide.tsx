import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {Chat} from "../../types/chats.type.ts";
import type {SearchedUser} from "../../types/user.type.ts";
import {Search, SquarePen, X} from "lucide-react";
import styles from './ChatSide.module.scss'
import ChatList from "../ChatList/ChatList.tsx";
import SearchedUsersList from "../SearchedUsersList/SearchedUsersList.tsx";
import CreateGroupModal from "../CreateGroupModal/CreateGroupModal.tsx";
import useSearchedUsers from "../../queries/users/useSearchedUsers.ts";
import useCreateChat from "../../queries/chats/useCreateChat.ts";
import useDebouncedValue from "../../hooks/useDebouncedValue.ts";
import MobileNavMenu from "../MobileNavMenu/MobileNavMenu.tsx";
import {useAuthStore} from "../../store/auth.store.ts";

type ChatSideProps = {
    chats: Chat[] | undefined
    chatsLoading: boolean
    chatsError: boolean
}

const FILTERS = [
    {id: 'all', label: 'All'},
    {id: 'unread', label: 'Unread'},
    {id: 'groups', label: 'Groups'},
    {id: 'direct', label: 'Direct'},
] as const

const ChatSide = ({chats, chatsLoading, chatsError}: ChatSideProps) => {
    const [search, setSearch] = useState('')
    const [createGroupOpen, setCreateGroupOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]['id']>('all')
    const debouncedSearch = useDebouncedValue(search)
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)

    const { data: searchedUsers, isLoading: searchedUsersLoading, isError: searchedUsersError } = useSearchedUsers(debouncedSearch)
    const { mutate: createChat, isPending: isStartingChat } = useCreateChat()

    const filteredChats = useMemo(() => chats?.filter((chat) => {
        if (activeFilter === 'groups') return chat.type === 'group'
        if (activeFilter === 'direct') return chat.type === 'direct'
        if (activeFilter === 'unread') return chat.unreadCount > 0
        return true
    }), [chats, activeFilter])

    const handleSelectUser = (user: SearchedUser) => {
        createChat({type: 'direct', memberIds: [user.id]}, {
            onSuccess: ({chat}) => {
                setSearch('')
                navigate(`/chats/${chat.id}`)
            }
        })
    }

    return (
        <div className={styles.chatList}>
            <div className={styles.chatListHeader}>
                {user && <MobileNavMenu user={user}/>}
                <span>Chats</span>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.newChatButton}
                        title="New group"
                        onClick={() => setCreateGroupOpen(true)}
                    >
                        <SquarePen size={17} strokeWidth={2.2}/>
                    </button>
                </div>
            </div>

            <div className={styles.ruler}/>

            <div className={styles.searchWrapper}>
                <Search size={15} className={styles.searchIcon}/>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search.length > 0 && (
                    <button type="button" className={styles.clearSearchButton} onClick={() => setSearch('')} title="Clear">
                        <X size={14}/>
                    </button>
                )}
            </div>

            {search.length === 0 && (
                <div className={styles.filterTabs}>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            className={`${styles.filterTab} ${activeFilter === filter.id ? styles.filterTabActive : ''}`}
                            onClick={() => setActiveFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            )}

            {search.length === 0 ?
                <ChatList chats={filteredChats} isLoading={chatsLoading} isError={chatsError} activeFilter={activeFilter}/>
                :
                <SearchedUsersList
                    users={searchedUsers}
                    isLoading={searchedUsersLoading}
                    isError={searchedUsersError}
                    onSelect={handleSelectUser}
                    isSelecting={isStartingChat}
                />
            }

            <CreateGroupModal open={createGroupOpen} onOpenChange={setCreateGroupOpen}/>
        </div>
    )
}

export default ChatSide
