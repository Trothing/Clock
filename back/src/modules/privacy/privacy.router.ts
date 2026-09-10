import {Router} from "express";
import {getSettings, updateSettings} from "./privacy.controller.js";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";

const privacyRouter = Router()

privacyRouter.use(authMiddleware)

privacyRouter.get('/settings', getSettings)
privacyRouter.patch('/settings', updateSettings)

export default privacyRouter
