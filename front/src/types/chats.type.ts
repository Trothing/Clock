import { z } from 'zod'

export const chatTypeSchema = z.enum(['direct', 'group'])

export const createChatSchema = z.object({
    type: chatTypeSchema,
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url('Invalid link').optional(),
    memberIds: z.array(z.number().int().positive()),
}).superRefine((data, ctx) => {
    if (data.type === 'direct') {
        if (data.memberIds.length !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A direct chat requires exactly one member",
                path: ['memberIds'],
            })
        }
        if (data.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A direct chat cannot have a name',
                path: ['name'],
            })
        }
    }
})

export const updateChatSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url('Invalid link').optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
})

export type CreateChatFormData = z.infer<typeof createChatSchema>
export type UpdateChatFormData = z.infer<typeof updateChatSchema>

export type LastMessagePreview = {
    content: string | null,
    type: 'text' | 'image' | 'file' | 'system',
    createdAt: string,
    senderId: number | null,
    deletedAt: string | null,
    attachmentMimeType: string | null,
}

export type OtherChatUser = {
    id: number,
    name: string | null,
    username: string,
    avatarUrl: string | null,
    avatarColor: string | null,
    lastSeenAt: string | null,
    status: 'online' | 'offline' | null,
    lastReadMessageId: number | null,
}

export type ChatSettings = {
    isMuted: boolean,
    isPinned: boolean,
    isArchived: boolean,
}

export const updateChatSettingsSchema = z.object({
    isMuted: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
})

export type UpdateChatSettingsFormData = z.infer<typeof updateChatSettingsSchema>

export type Chat = {
    id: number,
    type: z.infer<typeof chatTypeSchema>,
    name: string | null,
    avatarUrl: string | null,
    createdAt: string,
    lastMessageId: number | null,
    isSelfChat: boolean,
    lastMessage: LastMessagePreview | null,
    otherUser: OtherChatUser | null,
    settings: ChatSettings,
    unreadCount: number,
}

export type CreateChatResponse = {
    chat: Chat,
    skippedMemberIds: number[],
}

export type GetChatsResponse = {
    chats: Chat[],
}

export type GetChatResponse = {
    chat: Chat,
}

export type UpdateChatResponse = {
    chat: Chat,
}
