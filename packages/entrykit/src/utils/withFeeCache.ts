import { Chain, createClient, http } from "viem";
import { cachedFeesPerGas } from "../actions/cachedFeesPerGas";

type WithFeeCacheOptions = {
  refreshInterval?: number;
};

export function withFeeCache(chain: Chain, options: WithFeeCacheOptions = { refreshInterval: 10_000 }): Chain {
  if (chain.fees?.estimateFeesPerGas) {
    throw new Error("withFeeCache: estimateFeesPerGas already defined in chain config");
  }

  const client = createClient({
    chain,
    transport: http(),
  });

  return {
    ...chain,
    fees: {
      ...chain.fees,
      estimateFeesPerGas: cachedFeesPerGas(client, options),
    },
  };
}
