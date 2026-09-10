import { io } from 'socket.io-client'
import {env} from "../config/env.ts";
import {useAuthStore} from "../store/auth.store.ts";

export const socket = io(env.VITE_API_URL, {
    autoConnect: false
})

export function connectSocket(){
    const token = useAuthStore.getState().accessToken
    if(!token) return
    socket.auth = {token}
    socket.connect()
}

export function disconnectSocket() {
    socket.disconnect()
}