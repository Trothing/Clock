import {AppError} from "./errorHandler.js";
import {ExtendedError} from "socket.io";
import {verifyAccessToken} from "../../modules/tokens/tokens.service.js";
import {findUserById} from "../../modules/users/users.repository.js";
import type {AppSocket} from "../../types/socket.type.js";

export async function authSocketMiddleware(
    socket: AppSocket,
    next: (err?: ExtendedError) => void
){
    try{
        const token = socket.handshake.auth.token as string | undefined

        if (!token) {
            return next(new AppError('Unauthorized', 401))
        }

        const payload = verifyAccessToken(token)
        const user = await findUserById(payload.userId)

        if (!user) {
            return next(new AppError('Unauthorized', 401))
        }

        socket.data.user = user

        next()
    }catch(err){
        next(new AppError('Unauthorized', 401))
    }
}