import {createServer} from 'http';
import {app} from "./app.js";
import {Server} from "socket.io";
import type {DefaultEventsMap} from "socket.io";
import {env} from "./config/env.js";
import {closeDb} from "./config/db.js";
import {setupSocket} from "./socket/index.js";
import {setIo} from "./socket/ioInstance.js";
import type {SocketData} from "./types/socket.type.js";

const httpServer = createServer(app);

const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer,{
    cors: {origin: '*'}
})

setIo(io)
setupSocket(io)

httpServer.listen(env.PORT, () => {
    console.log('Server is running on Port: ',env.PORT)
})

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    io.close();
    httpServer.close(async () => {
        await closeDb();
        process.exit(0);
    });
});