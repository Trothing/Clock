import {z} from 'zod'
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import {attachmentsTable} from "../../db/schemes/chats/attachments.schema.js";

export type NewAttachmentDB = InferInsertModel<typeof attachmentsTable>
export type AttachmentDB = InferSelectModel<typeof attachmentsTable>

export type AttachmentPublic = Omit<AttachmentDB, 'messageId'>

export const attachmentInputSchema = z.object({
    url: z.string().url(),
    mimeType: z.string().min(1),
    size: z.number().int().positive(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().int().positive().optional(),
})

export type AttachmentInput = z.infer<typeof attachmentInputSchema>
