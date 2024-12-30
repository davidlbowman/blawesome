import "@/lib/drizzle/envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const db = drizzle();
