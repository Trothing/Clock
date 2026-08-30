import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from "./modules/auth/auth.router.js";
import {ErrorHandler} from "./shared/middleware/errorHandler.js";

export const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)

app.use(ErrorHandler)