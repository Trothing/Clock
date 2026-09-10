import {Router} from "express";
import {addReaction, removeReaction} from "./reactions.controller.js";

const reactionsRouter = Router({mergeParams: true})

reactionsRouter.post('/', addReaction)
reactionsRouter.delete('/', removeReaction)

export default reactionsRouter
