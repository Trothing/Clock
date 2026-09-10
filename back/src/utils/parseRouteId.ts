import {AppError} from "../shared/middleware/errorHandler.js";

export function parseRouteId(rawId: string | string[], label: string) {
    const id = Number(rawId)
    if (typeof rawId !== 'string' || !Number.isInteger(id)) {
        throw new AppError(`Invalid ${label}`, 400)
    }
    return id
}
