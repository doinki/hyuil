import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  KEEPALIVE_TIMEOUT: z.coerce.number().int().positive().default(20_000),
  PORT: z.coerce.number().int().positive().default(3000),
  SERVICE_KEY: z.string(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(z.flattenError(result.error).fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
