import { createTRPCProxyClient, httpBatchLink, CreateTRPCProxyClient } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./createAppRouter";

type CreateIndexerClientOptions = {
  url: string;
};

export function createIndexerClient({ url }: CreateIndexerClientOptions): CreateTRPCProxyClient<AppRouter> {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [httpBatchLink({ url })],
  });
}
