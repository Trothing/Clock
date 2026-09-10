import type {DefaultEventsMap, Server, Socket} from "socket.io";
import type {UserDB} from "./users.type.js";

export type SocketData = {
    user?: UserDB
}

export type AppServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>
export type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>
