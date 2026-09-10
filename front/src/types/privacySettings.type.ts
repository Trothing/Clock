import {z} from 'zod'

export const privacyLevelSchema = z.enum(['everyone', 'contacts', 'nobody'])
export type PrivacyLevel = z.infer<typeof privacyLevelSchema>

export type PrivacySettings = {
    whoCanAddToGroups: PrivacyLevel
    whoCanMessage: PrivacyLevel
    whoCanSeeLastSeen: PrivacyLevel
    whoCanSeePhone: PrivacyLevel
    readReceiptsEnabled: boolean
}

export const updatePrivacySettingsSchema = z.object({
    whoCanAddToGroups: privacyLevelSchema.optional(),
    whoCanMessage: privacyLevelSchema.optional(),
    whoCanSeeLastSeen: privacyLevelSchema.optional(),
    whoCanSeePhone: privacyLevelSchema.optional(),
    readReceiptsEnabled: z.boolean().optional(),
})
export type UpdatePrivacySettingsFormData = z.infer<typeof updatePrivacySettingsSchema>

export type GetPrivacySettingsResponse = {
    settings: PrivacySettings
}
export type UpdatePrivacySettingsResponse = {
    settings: PrivacySettings
}
