import {Request, Response} from "express";
import {AppError} from "../../shared/middleware/errorHandler.js";

export function uploadFile(req: Request, res: Response) {
    if (!req.file) {
        throw new AppError('No file provided', 400)
    }

    const url = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`

    res.status(201).json({
        url,
        mimeType: req.file.mimetype,
        size: req.file.size,
    })
}
