import {createServer} from 'http';
import {app} from "./app.js";
import {Server} from "socket.io";
import {env} from "./config/env.js";
import {closeDb} from "./config/db.js";

const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors: {origin: '*'}
})

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