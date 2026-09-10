import {z} from 'zod'
import {createInsertSchema} from "drizzle-zod";
import {contactsTable} from "../db/schemes/contacts.schema.js";
import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import type {UserPublic} from "./users.type.js";

export const createContactSchema = createInsertSchema(contactsTable)
    .omit({id: true, userId: true, createdAt: true})

export const updateContactSchema = createInsertSchema(contactsTable)
    .pick({alias: true})
    .partial()

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>

export type NewContactDB = InferInsertModel<typeof contactsTable>
export type ContactDB = InferSelectModel<typeof contactsTable>

export type ContactWithUser = ContactDB & { user: UserPublic }
