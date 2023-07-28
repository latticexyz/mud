import { createTRPCProxyClient, httpBatchLink, CreateTRPCProxyClient } from "@trpc/client";
import superjson from "superjson";
import { AppRouter } from "./appRouter";

type CreateIndexerClientOptions = {
  url: string;
};

export function createIndexerClient({ url }: CreateIndexerClientOptions): CreateTRPCProxyClient<AppRouter> {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [httpBatchLink({ url })],
  });
}
