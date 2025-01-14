import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	ROOT_USER: z.string().email(),
	ROOT_PASSWORD: z.string(),
	JWT_SECRET: z.string(),
});

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export const env = envSchema.parse(process.env);
