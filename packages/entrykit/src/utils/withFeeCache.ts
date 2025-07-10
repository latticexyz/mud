import { Chain, createClient, EstimateFeesPerGasReturnType, http } from "viem";
import { estimateFeesPerGas } from "viem/actions";

type WithFeeCacheOptions = {
  updateInterval?: number;
};

export function withFeeCache(chain: Chain, options: WithFeeCacheOptions = { updateInterval: 10_000 }): Chain {
  console.log("withFeeCache", chain);
  if (chain.fees?.estimateFeesPerGas) {
    throw new Error("withFeeCache: estimateFeesPerGas already defined in chain config");
  }

  let fees: EstimateFeesPerGasReturnType<"eip1559"> | null = null;

  const client = createClient({
    chain,
    transport: http(),
  });

  async function updateFees() {
    console.log("updating fees");
    fees = await estimateFeesPerGas(client);
    console.log("updated fees", fees);
  }

  updateFees();
  setInterval(updateFees, options.updateInterval);

  return {
    ...chain,
    fees: {
      ...chain.fees,
      estimateFeesPerGas: async (args) => {
        console.log("asking for fees", args);
        return fees;
      },
    },
  };
}
