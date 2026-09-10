import {Request, Response} from "express";
import * as blockedUsersService from "./blockedUsers.service.js"
import {parseRouteId} from "../../utils/parseRouteId.js";

function parseUserId(rawId: string | string[]) {
    return parseRouteId(rawId, 'user id')
}

export async function getBlockedUsers(req: Request, res: Response) {
    const blockedUsers = await blockedUsersService.getBlockedUsers(req.user!.id)
    res.status(200).json({blockedUsers})
}

export async function blockUser(req: Request, res: Response) {
    const blockedUserId = parseUserId(req.params.userId)
    await blockedUsersService.blockUser(req.user!.id, blockedUserId)
    res.status(204).send()
}

export async function unblockUser(req: Request, res: Response) {
    const blockedUserId = parseUserId(req.params.userId)
    await blockedUsersService.unblockUser(req.user!.id, blockedUserId)
    res.status(204).send()
}
