import fs from "node:fs";
import path from "node:path";

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')

fs.mkdirSync(UPLOADS_DIR, {recursive: true})

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024
export const ATTACHMENT_MAX_SIZE = 25 * 1024 * 1024

export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const ATTACHMENT_MIME_TYPES = [
    ...AVATAR_MIME_TYPES,
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
    'application/pdf', 'application/zip',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
]
