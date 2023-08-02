import { z } from "zod";
import { StorageAdapter } from "./common";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TRPCPanelMeta } from "trpc-panel";
import { Address } from "abitype/zod";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAppRouter() {
  const t = initTRPC.meta<TRPCPanelMeta>().context<{ storageAdapter: StorageAdapter }>().create({
    transformer: superjson,
  });
  return t.router({
    findAll: t.procedure
      .meta({
        description: "Returns all the TODOs for a TODO contract",
      })
      .input(
        z
          .object({
            chainId: z.number().describe("Chain ID, e.g. 1 for Ethereum mainnet"),
            address: Address.describe("Contract address of the TODO"),
          })
          .describe("Location of the TODO contract")
      )
      .query(async (opts): ReturnType<StorageAdapter["findAll"]> => {
        const { storageAdapter } = opts.ctx;
        const { chainId, address } = opts.input;
        return storageAdapter.findAll(chainId, address);
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
