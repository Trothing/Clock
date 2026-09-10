import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {refreshApi} from "../../apis/auth/auth.api.ts";
import {useAuthStore} from "../../store/auth.store.ts";
import {useSocketStatusStore} from "../../store/socketStatus.store.ts";
import useChats from "../../queries/chats/useChats.ts";
import NavRail from "../../components/NavRail/NavRail.tsx";
import styles from './homePage.module.scss'
import ChatSide from "../../components/ChatSide/ChatSide.tsx";
import HomePageSkeleton from "./HomePageSkeleton.tsx";

const HomePage = () => {
    const [loading, setLoading] = useState(true)
    const [connectionError, setConnectionError] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const hasActiveChat = location.pathname !== '/'
    const user = useAuthStore((state) => state.user)

    const {data: chats, isLoading: chatsLoading, isError: chatsError} = useChats()
    const isSocketConnected = useSocketStatusStore((state) => state.isConnected)

    const attemptRefresh = async (retriesLeft: number) => {
        setLoading(true)
        setConnectionError(false)

        try {
            await refreshApi()
            setLoading(false)
        } catch (err) {
            const isUnauthorized = axios.isAxiosError(err) && err.response?.status === 401

            if (isUnauthorized) {
                navigate('/login')
                setLoading(false)
                return
            }

            if (retriesLeft > 0) {
                setTimeout(() => attemptRefresh(retriesLeft - 1), 1500)
                return
            }

            setConnectionError(true)
            setLoading(false)
        }
    }

    useEffect(() => {
        attemptRefresh(1)
    }, [])

    if (connectionError) {
        return (
            <div className={styles.connectionError}>
                <p>Failed to connect to the server</p>
                <button onClick={() => attemptRefresh(1)}>Try again</button>
            </div>
        )
    }

    if (loading || !user) {
        return <HomePageSkeleton/>
    }

    return (
        <div className={`${styles.shell} ${hasActiveChat ? styles.shellChatOpen : ''}`}>
            {!isSocketConnected && (
                <div className={styles.socketBanner}>Connection lost. Reconnecting...</div>
            )}
            <div className={styles.railSlot}>
                <NavRail user={user}/>
            </div>
            <div className={styles.chatSideSlot}>
                <ChatSide chats={chats} chatsLoading={chatsLoading} chatsError={chatsError}/>
            </div>
            <div className={styles.chatPane}>
                <Outlet/>
            </div>
        </div>
    );
};

export default HomePage;
