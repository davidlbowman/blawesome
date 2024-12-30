import { z } from "zod";

const envSchema = z.object({
	POSTGRES_URL: z.string().url(),
});

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export const env = envSchema.parse(process.env);
