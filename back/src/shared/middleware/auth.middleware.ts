import type {NextFunction, Response, Request} from "express";
import {AppError} from "./errorHandler.js";
import * as usersService from "../../modules/users/users.service.js";
import {verifyAccessToken, type TokenPayload} from "../../modules/tokens/tokens.service.js";
import {convertUserToPublic} from "../../modules/auth/utils.js";

export async function authMiddleware (req: Request, res: Response, next: NextFunction){
    const authHeader = req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('Unauthorized', 401)
    }

    const token = authHeader.slice('Bearer '.length)

    let payload: TokenPayload
    try {
        payload = verifyAccessToken(token)
    } catch {
        throw new AppError('Invalid or expired token', 401)
    }

    const user = await usersService.findById(payload.userId)
    if (!user) {
        throw new AppError('Unauthorized', 401)
    }

    req.user = convertUserToPublic(user)
    next()
}
