import { EstimateFeesPerGasParameters, Client, EstimateFeesPerGasReturnType } from "viem";
import { estimateFeesPerGas } from "viem/actions";

export type CreateFeeRefOptions = {
  client: Client;
  refreshInterval: number;
  args?: EstimateFeesPerGasParameters;
};

export type FeeRef = {
  fees: EstimateFeesPerGasReturnType | {};
  lastUpdatedTimestamp: number;
};

/** Update fee values once every `refreshInterval` instead of right before every request */
export function createFeeRef({ client, args, refreshInterval }: CreateFeeRefOptions): FeeRef {
  const feeRef: FeeRef = { fees: {}, lastUpdatedTimestamp: 0 };

  async function updateFees(): Promise<void> {
    const fees = await estimateFeesPerGas(client, args);
    feeRef.fees = fees;
    feeRef.lastUpdatedTimestamp = Date.now();
  }

  updateFees();
  setInterval(updateFees, refreshInterval);

  return feeRef;
}
