import { isDefined } from "@latticexyz/common/utils";
import { z, ZodIntersection, ZodTypeAny } from "zod";

const commonSchema = z.intersection(
  z.object({
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().positive().default(3001),
    START_BLOCK: z.coerce.bigint().nonnegative().default(0n),
    MAX_BLOCK_RANGE: z.coerce.bigint().positive().default(1000n),
    POLLING_INTERVAL: z.coerce.number().positive().default(1000),
  }),
  z
    .object({
      RPC_HTTP_URL: z.string(),
      RPC_WS_URL: z.string(),
    })
    .partial()
    .refine((values) => Object.values(values).some(isDefined))
);

export function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
  schema?: TSchema
): z.infer<TSchema extends ZodTypeAny ? ZodIntersection<typeof commonSchema, TSchema> : typeof commonSchema> {
  const envSchema = schema !== undefined ? z.intersection(commonSchema, schema) : commonSchema;
  return envSchema.parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });
}
