import {Router} from "express";
import * as blockedUsersController from "./blockedUsers.controller.js";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";

const blockedUsersRouter = Router()

blockedUsersRouter.use(authMiddleware)

blockedUsersRouter.get('/', blockedUsersController.getBlockedUsers)
blockedUsersRouter.post('/:userId', blockedUsersController.blockUser)
blockedUsersRouter.delete('/:userId', blockedUsersController.unblockUser)

export default blockedUsersRouter
