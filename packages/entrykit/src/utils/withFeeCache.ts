import { Chain, createClient, http } from "viem";
import { cachedFeesPerGas } from "../actions/cachedFeesPerGas";

type WithFeeCacheOptions = {
  updateInterval?: number;
};

export function withFeeCache(chain: Chain, options: WithFeeCacheOptions = { updateInterval: 10_000 }): Chain {
  console.log("withFeeCache", chain);
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
