import { isHex } from "viem";
import { z } from "zod";

export const input = z.object({
  chainId: z.number(),
  address: z.string().refine(isHex).optional(),
  filters: z
    .array(
      z.object({
        tableId: z.string().refine(isHex),
        key0: z.string().refine(isHex).optional(),
        key1: z.string().refine(isHex).optional(),
      })
    )
    .default([]),
});
