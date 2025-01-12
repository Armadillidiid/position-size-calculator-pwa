import { z } from "zod";

const envSchema = z.object({
  VITE_PUBLIC_ALPHA_VANTAGE_API_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export { env };

