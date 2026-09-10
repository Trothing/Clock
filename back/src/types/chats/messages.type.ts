import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {messagesTable} from "../../db/schemes/chats/messages.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import type {ReactionSummary} from "./reactions.type.js";
import {attachmentInputSchema, type AttachmentPublic} from "./attachments.type.js";

export const createMessageSchema = createInsertSchema(messagesTable, {
    type: z.enum(['text', 'image', 'file']),
})
    .omit({id: true, senderId: true, createdAt: true, editedAt: true, deletedAt: true, pinnedAt: true})
    .extend({attachment: attachmentInputSchema.optional()})
    .superRefine((data, ctx) => {
        if (data.type === 'text' && !data.content?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A text message cannot be empty',
                path: ['content'],
            })
        }
        if (data.type !== 'text' && !data.attachment) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'An attachment is required for this message type',
                path: ['attachment'],
            })
        }
    })

export const updateMessageSchema = z.object({
    content: z.string().min(1),
})

export type CreateMessageInput = z.infer<typeof createMessageSchema>
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>

export type NewMessageDB = InferInsertModel<typeof messagesTable>
export type MessageDB = InferSelectModel<typeof messagesTable>

export type MessagePublic = Omit<MessageDB, 'deletedAt'>

export type MessageSenderPublic = {
    id: number,
    username: string,
    name: string | null,
    avatarUrl: string | null,
    avatarColor: string | null,
}

export type MessageReplyPreview = {
    id: number,
    type: MessageDB['type'],
    content: string | null,
    isDeleted: boolean,
    sender: Omit<MessageSenderPublic, 'avatarUrl' | 'avatarColor'> | null,
}

export type MessageWithRelations = MessageDB & {
    sender: MessageSenderPublic | null,
    replyTo: MessageReplyPreview | null,
    reactions: ReactionSummary[],
    attachments: AttachmentPublic[],
}
