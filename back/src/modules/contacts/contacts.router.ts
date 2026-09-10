import {Router} from "express";
import * as contactsController from "./contacts.controller.js";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";

const contactsRouter = Router()

contactsRouter.use(authMiddleware)

contactsRouter.get('/', contactsController.getContacts)
contactsRouter.post('/', contactsController.addContact)
contactsRouter.delete('/:userId', contactsController.removeContact)

export default contactsRouter
