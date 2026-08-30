import { type Request, type Response } from "express";
import {createUserSchema, loginUserSchema} from "../../types/users.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import * as authService from './auth.service.js';
import {env} from "../../config/env.js";
import {convertUserToPublic} from "./utils.js";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'prod',
    sameSite: 'strict' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/auth/refresh',
}

export async function register (req: Request, res: Response) {
    const result = createUserSchema.safeParse(req.body)

    if(!result.success) {
        throw new AppError('Invalid format', 400)
    }
    const { user, accessToken, refreshToken } = await authService.register(result.data)

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    res.status(201).json({
        accessToken,
        user: convertUserToPublic(user)
    })
}

export async function login (req: Request, res: Response) {
    const result = loginUserSchema.safeParse(req.body)

    if(!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const { user, accessToken, refreshToken } = await authService.login(result.data)

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    res.status(200).json({
        accessToken,
        user: convertUserToPublic(user)
    })
}

export async function logout (req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined
    if (refreshToken) {
        await authService.logout(refreshToken)
    }
    res.clearCookie('refreshToken', { path: '/auth/refresh' })
    res.status(204).send()
}
