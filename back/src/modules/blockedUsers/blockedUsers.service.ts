import {AppError} from "../../shared/middleware/errorHandler.js";
import {findById} from "../users/users.service.js";
import * as blockedUsersRepository from './blockedUsers.repository.js'

export async function getBlockedUsers(userId: number) {
    return blockedUsersRepository.findBlockedUsersByUserId(userId)
}

export async function blockUser(userId: number, blockedUserId: number) {
    if (blockedUserId === userId) {
        throw new AppError('You cannot block yourself', 400)
    }

    const targetUser = await findById(blockedUserId)
    if (!targetUser) {
        throw new AppError('User not found', 404)
    }

    const existing = await blockedUsersRepository.findBlock(userId, blockedUserId)
    if (existing) {
        return existing
    }

    return blockedUsersRepository.createBlock(userId, blockedUserId)
}

export async function unblockUser(userId: number, blockedUserId: number) {
    await blockedUsersRepository.deleteBlock(userId, blockedUserId)
}
