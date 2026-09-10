import {createInsertSchema} from "drizzle-zod";
import {z} from "zod";
import {chatsTable} from "../../db/schemes/chats/chats.schema.js";
import {InferInsertModel, InferSelectModel} from "drizzle-orm";

const baseChatSchema = createInsertSchema(chatsTable, {
    name: (schema) => schema.min(1).max(100),
}).omit({
    id: true,
    createdAt: true,
    isSelfChat: true,
});

export const createChatSchema = baseChatSchema
    .extend({
        memberIds: z.array(z.number().int().positive()),
    })
    .superRefine((data, ctx) => {
        if (new Set(data.memberIds).size !== data.memberIds.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'memberIds must not contain duplicates',
                path: ['memberIds'],
            });
        }
        if (data.type === 'direct') {
            if (data.memberIds.length !== 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Direct chat requires exactly one memberId (the other user)',
                    path: ['memberIds'],
                });
            }
            if (data.name) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Direct chat cannot have a name',
                    path: ['name'],
                });
            }
        }
    });

export const updateChatSchema = baseChatSchema
    .pick({name: true, avatarUrl: true})
    .partial();

export type CreateChat = z.infer<typeof createChatSchema>;
export type UpdateChat = z.infer<typeof updateChatSchema>;
export type ChatDB = z.infer<typeof baseChatSchema>
export type NewChatDB = InferInsertModel<typeof chatsTable>
export type PublicChat = InferSelectModel<typeof chatsTable>

export type LastMessagePreview = {
    content: string | null,
    type: 'text' | 'image' | 'file' | 'system',
    createdAt: Date,
    senderId: number | null,
    deletedAt: Date | null,
    attachmentMimeType: string | null,
}
export type OtherChatUser = {
    id: number,
    name: string | null,
    username: string,
    avatarUrl: string | null,
    avatarColor: string | null,
    lastSeenAt: Date | null,
    status: 'online' | 'offline' | null,
    lastReadMessageId: number | null,
}
export type ChatSettingsPublic = {
    isMuted: boolean,
    isPinned: boolean,
    isArchived: boolean,
}
export type ChatListItem = PublicChat & {
    lastMessage: LastMessagePreview | null,
    otherUser: OtherChatUser | null,
    settings: ChatSettingsPublic,
    unreadCount: number,
}
export type ChatWithOtherUser = PublicChat & {
    otherUser: OtherChatUser | null,
    settings: ChatSettingsPublic,
    unreadCount: number,
}