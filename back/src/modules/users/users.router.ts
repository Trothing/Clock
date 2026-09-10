import {Router} from "express";
import * as usersController from './users.controller.js'
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";

const usersRouter = Router()

usersRouter.use(authMiddleware)

usersRouter.get('/me', usersController.getProfile)
usersRouter.patch('/me', usersController.updateProfile)
usersRouter.post('/search-user-by-username', usersController.searchUsersByUsername)

export default usersRouter;