import postgres from "postgres";
import {env} from "./env.js";
import * as schema from '../db/index.js'
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(env.DATABASE_URL, {
    max: 20
})

export const db = drizzle(client, { schema })

export async function closeDb() {
    await client.end();
}