import {Router} from "express";
import {updateChatSettings} from "./chatSettings.controller.js";

const chatSettingsRouter = Router({mergeParams: true})

chatSettingsRouter.patch('/', updateChatSettings)

export default chatSettingsRouter
