import {RouterProvider} from "react-router-dom";
import {useAuthStore} from "./store/auth.store.ts";
import {useEffect} from "react";
import {connectSocket, disconnectSocket, socket} from "./sockets/socket.ts";
import {useSocketStatusStore} from "./store/socketStatus.store.ts";
import {router} from "./router.tsx";
import useSocketListeners from "./sockets/listeners/useSocketListeners.ts";

function SocketConnector() {
    const user = useAuthStore((state) => state.user);
    const setConnected = useSocketStatusStore((state) => state.setConnected);

    useEffect(() => {
        if (user) {
            connectSocket();
        }
        return () => disconnectSocket();
    }, [user]);

    useEffect(() => {
        const handleConnect = () => setConnected(true)
        const handleDisconnect = () => setConnected(false)
        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)
        socket.on('connect_error', handleDisconnect)
        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
            socket.off('connect_error', handleDisconnect)
        }
    }, [setConnected])

    useSocketListeners();

    return <RouterProvider router={router} />;
}

export default SocketConnector