import type {NextFunction, Response, Request} from "express";
import {env} from "../../config/env.js";

export class AppError extends Error{
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function ErrorHandler (error: AppError | Error, req: Request, res: Response ,next: NextFunction) {
    const isAppError = error instanceof AppError

    const statusCode = isAppError ? error.statusCode : 500
    const message = isAppError?  error.message : 'Internal server error'

    if (!isAppError) {
        console.error('Unexpected error:', error);
    }

    res.status(statusCode).json({
        message,
        ...(env.NODE_ENV === 'dev' && { stack: error.stack }),
    })
}