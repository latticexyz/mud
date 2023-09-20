import { isHex, parseEther } from "viem";
import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";

const commonSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().positive().default(3002),
  RPC_HTTP_URL: z.string(),
  FAUCET_PRIVATE_KEY: z.string().refine(isHex),
  DRIP_AMOUNT_ETHER: z
    .string()
    .default("1")
    .transform((ether) => parseEther(ether)),
});

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
