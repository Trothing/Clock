import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import multer, {type FileFilterCallback} from "multer";
import {fileTypeFromFile} from "file-type";
import type {NextFunction, Request, Response} from "express";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {
    ATTACHMENT_MAX_SIZE,
    ATTACHMENT_MIME_TYPES,
    AVATAR_MAX_SIZE,
    AVATAR_MIME_TYPES,
    UPLOADS_DIR,
} from "../../config/uploads.js";

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv'])

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
})

function mimeTypeFilter(allowed: string[]) {
    return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (!allowed.includes(file.mimetype)) {
            cb(new Error('Unsupported file type'))
            return
        }
        cb(null, true)
    }
}

export const avatarUpload = multer({
    storage,
    limits: {fileSize: AVATAR_MAX_SIZE},
    fileFilter: mimeTypeFilter(AVATAR_MIME_TYPES),
})

export const attachmentUpload = multer({
    storage,
    limits: {fileSize: ATTACHMENT_MAX_SIZE},
    fileFilter: mimeTypeFilter(ATTACHMENT_MIME_TYPES),
})

async function looksLikeText(filePath: string): Promise<boolean> {
    const handle = await fs.open(filePath, 'r')
    try {
        const buffer = Buffer.alloc(8192)
        const {bytesRead} = await handle.read(buffer, 0, buffer.length, 0)
        return !buffer.subarray(0, bytesRead).includes(0)
    } finally {
        await handle.close()
    }
}

export function verifyFileContent(allowed: string[]) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.file) {
            next()
            return
        }

        try {
            const detected = await fileTypeFromFile(req.file.path)

            if (detected) {
                if (!allowed.includes(detected.mime)) {
                    await fs.unlink(req.file.path)
                    next(new AppError('File content does not match its declared type', 400))
                    return
                }
                req.file.mimetype = detected.mime
            } else if (TEXT_MIME_TYPES.has(req.file.mimetype) && await looksLikeText(req.file.path)) {
            } else {
                await fs.unlink(req.file.path)
                next(new AppError('Failed to detect file type', 400))
                return
            }

            next()
        } catch (err) {
            next(err)
        }
    }
}

export function handleUploadError(err: unknown, _req: Request, _res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError('File is too large', 413))
        return
    }
    if (err instanceof Error) {
        next(new AppError(err.message || 'File upload error', 400))
        return
    }
    next(err)
}
