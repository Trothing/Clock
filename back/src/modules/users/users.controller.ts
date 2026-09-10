import {NextFunction, Response, Request} from "express";
import * as userService from './users.service.js'
import {searchUsersByUsernameSchema, updateUserSchema, UserPublic} from "../../types/users.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";

export function getProfile(req: Request, res: Response, next: NextFunction) {
    res.status(200).json(req.user);
}

export async function updateProfile(req: Request, res: Response) {
    const result = updateUserSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid data', 400)
    }

    const updated = await userService.updateProfile(req.user!.id, result.data)
    res.status(200).json(updated)
}
export async function searchUsersByUsername(req: Request, res: Response, next: NextFunction){
    const result = searchUsersByUsernameSchema.safeParse(req.body)

    if(!result.success){
        throw new AppError('Invalid data', 400)
    }
    const {search, limit} = result.data

    const authorId = req.user!.id

    const searchedUsers = await userService.searchUsersByUsername(search, limit, authorId)


    res.status(200).json({users: searchedUsers})
}