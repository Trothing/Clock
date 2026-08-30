import type {CreateUserInput, LoginUserInput, UserDB} from "../../types/users.type.js";
import * as authRepository from './auth.repository.js'
import {compareSecretData, hashSecretData} from "../../utils.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import jwt from 'jsonwebtoken'
import {env} from "../../config/env.js";

type TokenPayload = {
    userId: number,
}

export async function register(newUser: CreateUserInput) {
    const existingUser = await authRepository.findUserByEmailOrUsername(newUser.email, newUser.username)
    if (existingUser) {
        throw new AppError('User with this email or username already exists', 409)
    }

    const passwordHash = await hashSecretData(newUser.password)

    const newDBUser = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        description: newUser.description,
        passwordHash
    }

    const user = await authRepository.createUser(newDBUser)

    if(!user){
        throw new AppError('Something went wrong, user didn\'t created', 500)
    }
    const {accessToken, refreshToken} = await createTokens(user)
    return {
        user, accessToken, refreshToken
    }
}

export async function login(userData: LoginUserInput){
    const user = await authRepository.findUserByIdentifier(userData.identifier)
    if(!user){
        throw new AppError('Invalid credentials', 401)
    }

    const isPasswordValid = await compareSecretData(userData.password, user.passwordHash)
    if(!isPasswordValid){
        throw new AppError('Invalid credentials', 401)
    }

    const {accessToken, refreshToken} = await createTokens(user)
    return {
        user, accessToken, refreshToken
    }
}


export async function logout(refreshToken: string) {
    let payload: TokenPayload
    try {
        payload = verifyRefreshToken(refreshToken) as TokenPayload
    } catch {
        return
    }

    const records = await authRepository.findActiveJwtRecordsByUserId(payload.userId)

    for (const record of records) {
        if (await compareSecretData(refreshToken, record.tokenHash)) {
            await authRepository.revokeJwtRecord(record.id)
            return
        }
    }
}

export async function createTokens(user: UserDB) {
    const accessToken = generateAccessToken({userId: user.id})
    const refreshToken = generateRefreshToken({userId: user.id})

    const refreshTokenHash = await hashSecretData(refreshToken)

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

    const recordJwt = await authRepository.createJwtRecord(refreshTokenHash, expiresAt, user.id)

    if(!recordJwt){
        throw new AppError('Something went wrong, login failed', 500)
    }

    return {
        refreshToken,
        accessToken
    }
}

export function generateAccessToken (payload: TokenPayload) {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}
export function generateRefreshToken (payload: TokenPayload) {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
}
export function verifyAccessToken(token:string){
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET)
}
export function verifyRefreshToken(token:string){
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET)
}
