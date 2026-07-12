import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).optional(),
  HERMES_API_URL: z.url().default("http://127.0.0.1:8643"),
  HERMES_API_KEY: z.string().min(1).optional(),
  LINKUP_BASE_URL: z.url().default("https://api.linkup.so/v1"),
  LINKUP_API_KEY: z.string().min(1).optional(),
  DUMMY_API_MODE: z.coerce.boolean().default(true),
});

export const env = envSchema.parse(process.env);
