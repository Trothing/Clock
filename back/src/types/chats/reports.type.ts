import {z} from 'zod'

export const createReportSchema = z.object({
    reason: z.string().max(500).optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
