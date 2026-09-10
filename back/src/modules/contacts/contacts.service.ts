import {AppError} from "../../shared/middleware/errorHandler.js";
import {CreateContactInput} from "../../types/contacts.type.js";
import {findById} from "../users/users.service.js";
import * as contactsRepository from './contacts.repository.js'

export async function getContacts(userId: number) {
    return contactsRepository.findContactsByUserId(userId)
}

export async function addContact(userId: number, data: CreateContactInput) {
    if (data.contactUserId === userId) {
        throw new AppError('You cannot add yourself as a contact', 400)
    }

    const targetUser = await findById(data.contactUserId)
    if (!targetUser) {
        throw new AppError('User not found', 404)
    }

    const existing = await contactsRepository.findContact(userId, data.contactUserId)
    if (existing) {
        throw new AppError('This user is already in your contacts', 409)
    }

    return contactsRepository.createContact({userId, contactUserId: data.contactUserId, alias: data.alias})
}

export async function removeContact(userId: number, contactUserId: number) {
    const existing = await contactsRepository.findContact(userId, contactUserId)
    if (!existing) {
        throw new AppError('Contact not found', 404)
    }

    await contactsRepository.deleteContact(userId, contactUserId)
}
