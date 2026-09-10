import 'express'
import {UserPublic} from "../users.type.js";

declare global{
    namespace Express {
        interface Request{
            user?: UserPublic;
        }
    }
}