import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from "./modules/auth/auth.router.js";
import {ErrorHandler} from "./shared/middleware/errorHandler.js";
import usersRouter from "./modules/users/users.router.js";
import chatsRouter from "./modules/chats/chats.router.js";
import messageRouter from "./modules/messages/messages.router.js";
import contactsRouter from "./modules/contacts/contacts.router.js";
import blockedUsersRouter from "./modules/blockedUsers/blockedUsers.router.js";
import privacyRouter from "./modules/privacy/privacy.router.js";
import uploadsRouter from "./modules/uploads/uploads.router.js";
import {UPLOADS_DIR} from "./config/uploads.js";
import {env} from "./config/env.js";

export const app = express()

const allowedOrigins = [...new Set([
    env.CLIENT_ORIGIN,
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
])]

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use('/files', express.static(UPLOADS_DIR))

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/chats', chatsRouter)
app.use('/messages', messageRouter)
app.use('/contacts', contactsRouter)
app.use('/blocked-users', blockedUsersRouter)
app.use('/privacy', privacyRouter)
app.use('/uploads', uploadsRouter)

app.use(ErrorHandler)