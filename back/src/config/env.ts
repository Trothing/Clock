import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    CLIENT_ORIGIN: z.string().url(),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['prod', 'dev', 'stage']),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;