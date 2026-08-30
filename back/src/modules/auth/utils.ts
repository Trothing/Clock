import {UserDB, UserPublic} from "../../types/users.type.js";

export function convertUserToPublic(user: UserDB): UserPublic{
    const {passwordHash, ...rest} = user
    return rest
}