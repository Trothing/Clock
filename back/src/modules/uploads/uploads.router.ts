import {Router} from "express";
import {authMiddleware} from "../../shared/middleware/auth.middleware.js";
import {attachmentUpload, avatarUpload, handleUploadError, verifyFileContent} from "./uploads.middleware.js";
import {uploadFile} from "./uploads.controller.js";
import {ATTACHMENT_MIME_TYPES, AVATAR_MIME_TYPES} from "../../config/uploads.js";

const uploadsRouter = Router()

uploadsRouter.use(authMiddleware)

uploadsRouter.post('/avatar', avatarUpload.single('file'), handleUploadError, verifyFileContent(AVATAR_MIME_TYPES), uploadFile)
uploadsRouter.post('/attachment', attachmentUpload.single('file'), handleUploadError, verifyFileContent(ATTACHMENT_MIME_TYPES), uploadFile)

export default uploadsRouter
