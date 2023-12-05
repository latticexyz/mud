import { QueryAdapter } from "./common";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { input } from "../indexer-client/input";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAppRouter() {
  const t = initTRPC.context<{ queryAdapter: QueryAdapter }>().create({
    transformer: superjson,
  });

  return t.router({
    getLogs: t.procedure.input(input).query(async (opts): ReturnType<QueryAdapter["getLogs"]> => {
      const { queryAdapter } = opts.ctx;
      const { chainId, address, filters } = opts.input;
      return queryAdapter.getLogs({ chainId, address, filters });
    }),

    findAll: t.procedure.input(input).query(async (opts): ReturnType<QueryAdapter["findAll"]> => {
      const { queryAdapter } = opts.ctx;
      const { chainId, address, filters } = opts.input;
      return queryAdapter.findAll({ chainId, address, filters });
    }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
