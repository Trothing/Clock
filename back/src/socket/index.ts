import {authSocketMiddleware} from "../shared/middleware/auth.socket.middleware.js";
import {handleConnection} from "./connectionHandler.js";
import type {AppServer} from "../types/socket.type.js";
import {registerTypingHandlers} from "./typingHandlers.js";
import {stopAllTypingForUser} from "./typingState.js";
import {setStatusOffline, setStatusOnline} from "./onlineState.js";
import {updateNumberOfConnectionsState} from "./numberOfConnectionsState.js";

export function setupSocket(io: AppServer){
    io.use(authSocketMiddleware)

    io.on('connection', (socket) => {
        const userId = socket.data.user!.id
        const userUsername = socket.data.user!.username

        console.log(`[${new Date().toLocaleString('uk-UA')}] Client - ${userUsername}, is connected: ${socket.id}`)

        handleConnection(socket)
        updateNumberOfConnectionsState('increase', userId)
        setStatusOnline(userId)
        registerTypingHandlers(io, socket)

        socket.on('disconnect', ()=> {
            console.log(`[${new Date().toLocaleString('uk-UA')}] Client is disconnected`, socket.id)
            updateNumberOfConnectionsState('decrease', userId)
            stopAllTypingForUser(userId)
            setStatusOffline(userId)
        })

    })
}
