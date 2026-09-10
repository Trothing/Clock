import { z } from 'zod'

export const messageTypeSchema = z.enum(['text', 'image', 'file'])

export const attachmentInputSchema = z.object({
    url: z.string().url(),
    mimeType: z.string().min(1),
    size: z.number().int().positive(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().int().positive().optional(),
})
export type AttachmentInput = z.infer<typeof attachmentInputSchema>

export const createMessageSchema = z.object({
    type: messageTypeSchema,
    content: z.string().optional(),
    replyToMessageId: z.number().int().positive().optional(),
    chatId: z.number().int().positive(),
    attachment: attachmentInputSchema.optional(),
    forwardedFromSenderId: z.number().int().positive().optional(),
    forwardedFromSenderName: z.string().optional(),
}).superRefine((data, ctx) => {
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

export type CreateMessageFormData = z.infer<typeof createMessageSchema>
export type UpdateMessageFormData = z.infer<typeof updateMessageSchema>

export type MessageSender = {
    id: number,
    username: string,
    name: string | null,
    avatarUrl: string | null,
    avatarColor: string | null,
}

export type MessageReplyPreview = {
    id: number,
    type: 'text' | 'image' | 'file' | 'system',
    content: string | null,
    isDeleted: boolean,
    sender: Omit<MessageSender, 'avatarUrl' | 'avatarColor'> | null,
}

export type ReactionSummary = {
    emoji: string,
    count: number,
    userIds: number[],
}

export type Attachment = {
    id: number,
    url: string,
    mimeType: string,
    size: number,
    width: number | null,
    height: number | null,
    duration: number | null,
    createdAt: string,
}

export type Message = {
    id: number,
    chatId: number,
    senderId: number | null,
    replyToMessageId: number | null,
    type: 'text' | 'image' | 'file' | 'system',
    content: string | null,
    createdAt: string,
    editedAt: string | null,
    deletedAt: string | null,
    pinnedAt: string | null,
    forwardedFromSenderId: number | null,
    forwardedFromSenderName: string | null,
    sender: MessageSender | null,
    replyTo: MessageReplyPreview | null,
    reactions: ReactionSummary[],
    attachments: Attachment[],
}
