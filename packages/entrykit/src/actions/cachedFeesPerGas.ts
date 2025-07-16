import { Client, EstimateFeesPerGasReturnType } from "viem";
import { estimateFeesPerGas } from "viem/actions";

type CachedFeesPerGasOptions = {
  refreshInterval?: number;
};

export function cachedFeesPerGas(
  client: Client,
  options: CachedFeesPerGasOptions = { refreshInterval: 10_000 },
): () => Promise<EstimateFeesPerGasReturnType<"eip1559">> {
  let fees: EstimateFeesPerGasReturnType<"eip1559"> | null = null;

  async function refreshFees() {
    fees = await estimateFeesPerGas(client);
  }

  refreshFees();
  setInterval(refreshFees, options.refreshInterval);

  return async () => {
    if (fees) return fees;
    fees = await estimateFeesPerGas(client);
    return fees;
  };
}
