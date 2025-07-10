import { Client, EstimateFeesPerGasReturnType } from "viem";
import { estimateFeesPerGas } from "viem/actions";

type CachedFeesPerGasOptions = {
  updateInterval?: number;
};

export function cachedFeesPerGas(
  client: Client,
  options: CachedFeesPerGasOptions = { updateInterval: 30_000 },
): () => Promise<EstimateFeesPerGasReturnType<"eip1559">> {
  let fees: EstimateFeesPerGasReturnType<"eip1559"> | null = null;

  async function updateFees() {
    console.log("updating fees");
    fees = await estimateFeesPerGas(client);
  }

  updateFees();
  setInterval(updateFees, options.updateInterval);

  return async () => {
    console.log("asking for fees");
    if (fees) return fees;
    fees = await estimateFeesPerGas(client);
    return fees;
  };
}
