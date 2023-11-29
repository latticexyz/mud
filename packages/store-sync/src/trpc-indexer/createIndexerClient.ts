import { createTRPCProxyClient, httpBatchLink, CreateTRPCProxyClient } from "@trpc/client";
import type { AppRouter } from "./createAppRouter";
import { transformer } from "./transformer";

type CreateIndexerClientOptions = {
  /**
   * tRPC endpoint URL like `https://indexer.dev.linfra.xyz/trpc`.
   */
  url: string;
};

/**
 * Creates a tRPC client to talk to a MUD indexer.
 *
 * @param {CreateIndexerClientOptions} options See `CreateIndexerClientOptions`.
 * @returns {CreateTRPCProxyClient<AppRouter>} A typed tRPC client.
 */
export function createIndexerClient({ url }: CreateIndexerClientOptions): CreateTRPCProxyClient<AppRouter> {
  return createTRPCProxyClient<AppRouter>({
    transformer,
    links: [httpBatchLink({ url })],
  });
}
