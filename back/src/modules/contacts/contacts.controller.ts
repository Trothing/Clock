import {Request, Response} from "express";
import {AppError} from "../../shared/middleware/errorHandler.js";
import {createContactSchema} from "../../types/contacts.type.js";
import * as contactsService from "./contacts.service.js"
import {parseRouteId} from "../../utils/parseRouteId.js";

function parseUserId(rawId: string | string[]) {
    return parseRouteId(rawId, 'user id')
}

export async function getContacts(req: Request, res: Response) {
    const contacts = await contactsService.getContacts(req.user!.id)
    res.status(200).json({contacts})
}

export async function addContact(req: Request, res: Response) {
    const result = createContactSchema.safeParse(req.body)
    if (!result.success) {
        throw new AppError('Invalid format', 400)
    }

    const contact = await contactsService.addContact(req.user!.id, result.data)
    res.status(201).json({contact})
}

export async function removeContact(req: Request, res: Response) {
    const contactUserId = parseUserId(req.params.userId)
    await contactsService.removeContact(req.user!.id, contactUserId)
    res.status(204).send()
}
