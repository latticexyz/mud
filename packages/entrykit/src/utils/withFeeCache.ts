import { Chain, createClient, http } from "viem";
import { cachedFeesPerGas } from "../actions/cachedFeesPerGas";

type WithFeeCacheOptions = {
  refreshInterval?: number;
};

export function withFeeCache<chain extends Chain>(
  chain: chain,
  options: WithFeeCacheOptions = { refreshInterval: 10_000 },
): chain {
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
