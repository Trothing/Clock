import type {AppServer} from "../types/socket.type.js";

let io: AppServer | null = null;

export function setIo(instance: AppServer) {
    io = instance;
}

export function getIo(): AppServer {
    if (!io) {
        throw new Error('Socket.IO server is not initialized yet');
    }
    return io;
}
