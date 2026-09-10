import {Request, Response} from "express";
import {updatePrivacySettingsSchema} from "../../types/privacySettings.type.js";
import {AppError} from "../../shared/middleware/errorHandler.js";
import * as privacyService from "./privacy.service.js"

export async function getSettings(req: Request, res: Response) {
    const settings = await privacyService.getSettings(req.user!.id)
    res.status(200).json({settings})
}

export async function updateSettings(req: Request, res: Response) {
    const result = updatePrivacySettingsSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const settings = await privacyService.updateSettings(req.user!.id, result.data)
    res.status(200).json({settings})
}
