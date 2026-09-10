import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {privacySettingsTable} from "../db/schemes/privacySettings.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";

export const updatePrivacySettingsSchema = createInsertSchema(privacySettingsTable)
    .omit({userId: true, updatedAt: true})
    .partial()

export type UpdatePrivacySettingsInput = z.infer<typeof updatePrivacySettingsSchema>

export type NewPrivacySettingsDB = InferInsertModel<typeof privacySettingsTable>
export type PrivacySettingsDB = InferSelectModel<typeof privacySettingsTable>
export type PrivacySettingsPublic = Omit<PrivacySettingsDB, 'userId' | 'updatedAt'>
