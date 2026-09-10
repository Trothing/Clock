import fs from "node:fs/promises";
import path from "node:path";
import {fileTypeFromFile} from "file-type";
import {UPLOADS_DIR} from "../config/uploads.js";
import type {AttachmentInput} from "../types/chats/attachments.type.js";

export async function resolveVerifiedAttachment(input: AttachmentInput): Promise<AttachmentInput | null> {
    let filename: string
    try {
        filename = path.basename(new URL(input.url).pathname)
    } catch {
        return null
    }

    const filePath = path.join(UPLOADS_DIR, filename)
    if (path.dirname(filePath) !== UPLOADS_DIR) {
        return null
    }

    let stat
    try {
        stat = await fs.stat(filePath)
    } catch {
        return null
    }
    if (!stat.isFile()) {
        return null
    }

    const detected = await fileTypeFromFile(filePath)

    return {
        ...input,
        size: stat.size,
        mimeType: detected?.mime ?? input.mimeType,
    }
}
