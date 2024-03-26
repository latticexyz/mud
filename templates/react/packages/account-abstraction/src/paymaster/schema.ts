import { Hex, getAddress } from "viem";
import { z } from "zod";

const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;

export const addressSchema = z
  .string()
  .regex(addressPattern, { message: "not a valid hex address" })
  .transform((val) => getAddress(val));

export const hexNumberSchema = z
  .string()
  .regex(hexDataPattern)
  .or(z.number())
  .or(z.bigint())
  .superRefine((data, ctx) => {
    // This function is used to refine the input and provide a context where you have access to the path.
    try {
      BigInt(data); // Attempt to convert to BigInt to validate it can be done
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Invalid input, expected a value that can be converted to bigint.",
      });
    }
  })
  .transform((val) => BigInt(val));

export const hexDataSchema = z
  .string()
  .regex(hexDataPattern, { message: "not valid hex data" })
  .transform((val) => val.toLowerCase() as Hex);

const userOperationSchemaPaymasterV7 = z
  .object({
    sender: addressSchema,
    nonce: hexNumberSchema,
    factory: addressSchema.optional().transform((val) => val ?? undefined),
    factoryData: hexDataSchema.optional().transform((val) => val ?? undefined),
    callData: hexDataSchema,
    callGasLimit: hexNumberSchema.default(1n),
    verificationGasLimit: hexNumberSchema.default(1n),
    preVerificationGas: hexNumberSchema.default(1n),
    maxFeePerGas: hexNumberSchema,
    maxPriorityFeePerGas: hexNumberSchema,
    paymaster: addressSchema
      .nullable()
      .optional()
      .transform((val) => val ?? undefined),
    paymasterVerificationGasLimit: hexNumberSchema
      .nullable()
      .optional()
      .transform((val) => val ?? undefined),
    paymasterPostOpGasLimit: hexNumberSchema
      .nullable()
      .optional()
      .transform((val) => val ?? undefined),
    paymasterData: hexDataSchema
      .nullable()
      .optional()
      .transform((val) => val ?? undefined),
    signature: hexDataSchema.optional().transform((val) => {
      if (val === undefined) {
        return "0x";
      }
      return val;
    }),
  })
  .strict()
  .transform((val) => {
    return val;
  });

export const jsonRpcResultSchema = z
  .object({
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    result: z.unknown(),
  })
  .strict();

export const jsonRpcSchema = z
  .object({
    jsonrpc: z.literal("2.0"),
    id: z.number(),
    method: z.string(),
    params: z.array(z.unknown()).optional().default([]),
  })
  .strict();

export const pmSponsorUserOperationParamsSchema = z.tuple([userOperationSchemaPaymasterV7, addressSchema]);
