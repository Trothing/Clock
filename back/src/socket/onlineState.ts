import {getNumberOfConnectionsState} from "./numberOfConnectionsState.js";
import {getIo} from "./ioInstance.js";
import {db} from "../config/db.js";
import {usersTable} from "../db/index.js";
import {eq} from "drizzle-orm";

type UserId = number
type Status = 'online' | 'offline'

const OFFLINE_GRACE_MS = 8000

const statusByUser = new Map<UserId, Status>()
const pendingOfflineTimeouts = new Map<UserId, NodeJS.Timeout>()

export function setStatusOnline(userId: UserId){
    const pendingTimeout = pendingOfflineTimeouts.get(userId)
    if(pendingTimeout){
        clearTimeout(pendingTimeout)
        pendingOfflineTimeouts.delete(userId)
    }

    if(statusByUser.get(userId) === 'online') return

    statusByUser.set(userId, 'online')
    getIo().emit('presence:update', {userId, status: 'online'})
}

export function setStatusOffline(userId: UserId){
    if(getNumberOfConnectionsState(userId) > 0) return

    const existingTimeout = pendingOfflineTimeouts.get(userId)
    if(existingTimeout) clearTimeout(existingTimeout)

    const timeout = setTimeout(async () => {
        pendingOfflineTimeouts.delete(userId)
        if(getNumberOfConnectionsState(userId) > 0) return

        statusByUser.set(userId, 'offline')
        getIo().emit('presence:update', {userId, status: 'offline'})
        await db.update(usersTable).set({lastSeenAt: new Date()}).where(eq(usersTable.id, userId))
    }, OFFLINE_GRACE_MS)

    pendingOfflineTimeouts.set(userId, timeout)
}

export function getStatus(userId: UserId): Status {
    return statusByUser.get(userId) ?? 'offline'
}
