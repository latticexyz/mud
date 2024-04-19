import { EstimateFeesPerGasParameters, Client, EstimateFeesPerGasReturnType, FeeValuesType } from "viem";
import { estimateFeesPerGas as viem_estimateFeesPerGas } from "viem/actions";

export type CreateFeeRefOptions = {
  client: Client;
  refreshInterval: number;
  args?: EstimateFeesPerGasParameters;
  estimateFeesPerGas?: () => Promise<EstimateFeesPerGasReturnType>;
};

export type FeeRef<type extends FeeValuesType = FeeValuesType> = {
  fees: EstimateFeesPerGasReturnType<type> | {};
  lastUpdatedTimestamp: number;
};

/** Update fee values once every `refreshInterval` instead of right before every request */
export async function createFeeRef({
  client,
  args,
  refreshInterval,
  estimateFeesPerGas,
}: CreateFeeRefOptions): Promise<FeeRef> {
  const feeRef: FeeRef = { fees: {}, lastUpdatedTimestamp: 0 };

  async function updateFees(): Promise<void> {
    const fees = estimateFeesPerGas ? await estimateFeesPerGas() : await viem_estimateFeesPerGas(client, args);
    feeRef.fees = fees;
    feeRef.lastUpdatedTimestamp = Date.now();
  }

  setInterval(updateFees, refreshInterval);
  await updateFees();

  return feeRef;
}
