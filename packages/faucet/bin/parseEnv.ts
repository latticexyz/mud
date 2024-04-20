import { isHex, parseEther } from "viem";
import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";
import { encodedSignatureLength, tweetMaxLength } from "../src/common";

const postContentPrefixMaxLength = tweetMaxLength - encodedSignatureLength - 1;

const commonSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().positive().default(3002),
  RPC_HTTP_URL: z.string(),
  FAUCET_PRIVATE_KEY: z.string().refine(isHex),
  DRIP_AMOUNT_ETHER: z
    .string()
    .default("1")
    .transform((ether) => parseEther(ether)),
  DEV: z.boolean().default(false),
  POST_CONTENT_PREFIX: z
    .string()
    .max(
      postContentPrefixMaxLength,
      `Prefix must be shorter than ${postContentPrefixMaxLength + 1} characters to fit in a tweet.`,
    )
    .default(""),
  X_API_BEARER_TOKEN: z.string().optional(),
});

export function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
  schema?: TSchema,
): z.infer<TSchema extends ZodTypeAny ? ZodIntersection<typeof commonSchema, TSchema> : typeof commonSchema> {
  const envSchema = schema !== undefined ? z.intersection(commonSchema, schema) : commonSchema;
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(`\nMissing or invalid environment variables:\n\n`, error.flatten());
      process.exit(1);
    }
    throw error;
  }
}
