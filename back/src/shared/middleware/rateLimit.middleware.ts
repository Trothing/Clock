import rateLimit from "express-rate-limit";

export const credentialsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Too many attempts. Try again later.'},
})

export const refreshRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Too many attempts. Try again later.'},
})

export const messageRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Too many messages. Please wait a bit.'},
})
