import * as usersRepository from './users.repository.js'
import type {NewUserDB, UpdateUserInput, UserPublic} from "../../types/users.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {convertUserToPublic} from "../auth/utils.js";
import {getIo} from "../../socket/ioInstance.js";
import {randomAvatarColor} from "../../utils/avatarPalette.js";

export async function create(newUser: NewUserDB) {
    if(!newUser.name) newUser.name = newUser.username
    if(!newUser.avatarColor) newUser.avatarColor = randomAvatarColor()
    return usersRepository.createUser(newUser)
}

export async function findByIdentifier(identifier: string) {
    return usersRepository.findUserByIdentifier(identifier)
}

export async function findById(id: number) {
    return usersRepository.findUserById(id)
}

export async function findByEmailOrUsername(email: string, username: string) {
    return usersRepository.findUserByEmailOrUsername(email, username)
}
export async function searchUsersByUsername(search: string, limit: number = 20, authorId: number){
    return usersRepository.searchUsersByUsername(search, limit, authorId)
}
export async function getUsersByChatId(chatId: number){
    return await usersRepository.getUsersByChatId(chatId)
}

const CONFLICT_MESSAGES = {
    username: 'This username is already taken',
    email: 'This email is already in use',
    phone: 'This phone number is already in use',
} as const

export async function updateProfile(userId: number, data: UpdateUserInput) {
    if (Object.keys(data).length === 0) {
        throw new AppError('No fields to update', 400)
    }

    const conflict = await usersRepository.findConflictingUser(userId, data)
    if (conflict) {
        const field = conflict.username === data.username
            ? 'username'
            : conflict.email === data.email ? 'email' : 'phone'
        throw new AppError(CONFLICT_MESSAGES[field], 409)
    }

    const updated = await usersRepository.updateUser(userId, data)
    if (!updated) {
        throw new AppError('Something went wrong', 500)
    }

    const publicUser = convertUserToPublic(updated)
    getIo().emit('user:updated', publicUser)
    return publicUser
}