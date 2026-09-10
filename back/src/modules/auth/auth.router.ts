import {Router} from "express";
import {register, login, logout, refresh} from "./auth.controller.js";
import {credentialsRateLimiter, refreshRateLimiter} from "../../shared/middleware/rateLimit.middleware.js";

const authRouter = Router()

authRouter.post('/register', credentialsRateLimiter, register)
authRouter.post('/login', credentialsRateLimiter, login)
authRouter.post('/logout', logout)
authRouter.post('/refresh', refreshRateLimiter, refresh)

export default authRouter