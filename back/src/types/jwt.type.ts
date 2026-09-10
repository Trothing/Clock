import {type InferInsertModel, type InferSelectModel} from "drizzle-orm";
import {jwtTable} from "../db/schemes/jwt.schema.js";

export type NewJwtDB = InferInsertModel<typeof jwtTable>
export type JwtDB = InferSelectModel<typeof jwtTable>
