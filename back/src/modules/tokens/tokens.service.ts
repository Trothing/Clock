import jwt from 'jsonwebtoken'
import {randomUUID} from 'crypto'
import {env} from "../../config/env.js";
import * as tokensRepository from './tokens.repository.js'
import {compareSecretData, hashSecretData} from "../../utils.js";
import {AppError} from "../../shared/middleware/errorHandler.js";

export type TokenPayload = {
    userId: number,
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_GRACE_MS = 15 * 1000;

export function generateAccessToken (payload: TokenPayload) {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}
export function generateRefreshToken (payload: TokenPayload) {
    return jwt.sign({...payload, jti: randomUUID()}, env.REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
}
export function verifyAccessToken(token: string) {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload
}
export function verifyRefreshToken(token: string) {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload
}

export async function issueTokenPair(userId: number) {
    const accessToken = generateAccessToken({userId})
    const refreshToken = generateRefreshToken({userId})

    const refreshTokenHash = await hashSecretData(refreshToken)
    const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS)

    const record = await tokensRepository.createJwtRecord(refreshTokenHash, expiresAt, userId)
    if (!record) {
        throw new AppError('Something went wrong, login failed', 500)
    }

    return {accessToken, refreshToken}
}

export async function findMatchingRecord(userId: number, rawToken: string) {
    const records = await tokensRepository.findJwtRecordsByUserId(userId)
    for (const record of records) {
        if (await compareSecretData(rawToken, record.tokenHash)) {
            return record
        }
    }
    return null
}

export async function deleteToken(recordId: number) {
    return tokensRepository.deleteRefreshToken(recordId)
}

export async function markTokenUsed(recordId: number) {
    return tokensRepository.markRefreshTokenUsed(recordId)
}

export async function cleanupUsedTokens(userId: number) {
    const cutoff = new Date(Date.now() - REFRESH_GRACE_MS)
    return tokensRepository.deleteUsedTokensOlderThan(userId, cutoff)
}
