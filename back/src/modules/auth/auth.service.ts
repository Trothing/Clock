import type {CreateUserInput, LoginUserInput} from "../../types/users.type.js";
import * as usersService from '../users/users.service.js'
import * as tokensService from '../tokens/tokens.service.js'
import {compareSecretData, hashSecretData} from "../../utils.js";
import {AppError} from "../../shared/middleware/errorHandler.js";


export async function register(newUser: CreateUserInput) {
    const existingUser = await usersService.findByEmailOrUsername(newUser.email, newUser.username)
    if (existingUser) {
        throw new AppError('User with this email or username already exists', 409)
    }

    const passwordHash = await hashSecretData(newUser.password)

    let user
    try {
        user = await usersService.create({
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            description: newUser.description,
            passwordHash
        })
    } catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new AppError('User with this email or username already exists', 409)
        }
        throw err
    }

    if(!user){
        throw new AppError('Something went wrong, user didn\'t created', 500)
    }
    const {accessToken, refreshToken} = await tokensService.issueTokenPair(user.id)
    return {
        user, accessToken, refreshToken
    }
}

export async function login(userData: LoginUserInput){
    const user = await usersService.findByIdentifier(userData.identifier)
    if(!user){
        throw new AppError('Invalid credentials', 401)
    }

    const isPasswordValid = await compareSecretData(userData.password, user.passwordHash)
    if(!isPasswordValid){
        throw new AppError('Invalid credentials', 401)
    }

    const {accessToken, refreshToken} = await tokensService.issueTokenPair(user.id)
    return {
        user, accessToken, refreshToken
    }
}

export async function logout(refreshToken: string) {
    let payload: tokensService.TokenPayload
    try {
        payload = tokensService.verifyRefreshToken(refreshToken)
    } catch {
        return
    }

    const record = await tokensService.findMatchingRecord(payload.userId, refreshToken)
    if (record) {
        await tokensService.deleteToken(record.id)
    }
}

export async function refresh(refreshToken: string){
    let payload: tokensService.TokenPayload
    try{
        payload = tokensService.verifyRefreshToken(refreshToken)
    }catch{
        throw new AppError('Invalid or expired token', 401)
    }

    const user = await usersService.findById(payload.userId)
    if(!user) throw new AppError('Unauthorized', 401)

    const record = await tokensService.findMatchingRecord(user.id, refreshToken)
    if(!record) {
        throw new AppError('Unauthorized', 401)
    }

    if (record.usedAt) {
        const usedMsAgo = Date.now() - record.usedAt.getTime()
        if (usedMsAgo > tokensService.REFRESH_GRACE_MS) {
            throw new AppError('Unauthorized', 401)
        }
    } else {
        await tokensService.markTokenUsed(record.id)
    }

    await tokensService.cleanupUsedTokens(user.id)

    const {accessToken, refreshToken: newRefreshToken} = await tokensService.issueTokenPair(user.id)

    return { accessToken, refreshToken: newRefreshToken, user }
}