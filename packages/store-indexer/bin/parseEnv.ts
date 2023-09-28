import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";

const commonSchema = z.intersection(
  z.object({
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().positive().default(3001),
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    POLLING_INTERVAL: z.coerce.number().positive().default(1000),
  }),
  z.union([
    z.object({
      RPC_HTTP_URL: z.string(),
      RPC_WS_URL: z.string().optional(),
    }),
    z.object({
      RPC_HTTP_URL: z.string().optional(),
      RPC_WS_URL: z.string(),
    }),
  ])
);

export function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
  schema?: TSchema
): z.infer<TSchema extends ZodTypeAny ? ZodIntersection<typeof commonSchema, TSchema> : typeof commonSchema> {
  const envSchema = schema !== undefined ? z.intersection(commonSchema, schema) : commonSchema;
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const { _errors, ...invalidEnvVars } = error.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw error;
  }
}
