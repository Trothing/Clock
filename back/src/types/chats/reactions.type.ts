import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {reactionsTable} from "../../db/schemes/chats/reactions.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";

export const createReactionSchema = createInsertSchema(reactionsTable, {
    emoji: (schema) => schema.min(1).max(32).regex(/^[^<>&"']+$/, 'Invalid emoji'),
})
    .pick({emoji: true})

export type CreateReactionInput = z.infer<typeof createReactionSchema>

export type NewReactionDB = InferInsertModel<typeof reactionsTable>
export type ReactionDB = InferSelectModel<typeof reactionsTable>

export type ReactionSummary = {
    emoji: string,
    count: number,
    userIds: number[],
}
