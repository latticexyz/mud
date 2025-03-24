import { EstimateFeesPerGasParameters, Client, EstimateFeesPerGasReturnType } from "viem";
import { estimateFeesPerGas } from "viem/actions";
import { getAction } from "viem/utils";

export type CreateFeeRefOptions = {
  client: Client;
  refreshInterval: number;
  args?: EstimateFeesPerGasParameters;
};

export type FeeRef = {
  fees: EstimateFeesPerGasReturnType;
  lastUpdatedTimestamp: number;
};

/** Update fee values once every `refreshInterval` instead of right before every request */
export async function createFeeRef({ client, args, refreshInterval }: CreateFeeRefOptions): Promise<FeeRef> {
  const feeRef: FeeRef = { fees: {} as never, lastUpdatedTimestamp: 0 };
  await updateFees();
  setInterval(updateFees, refreshInterval);

  async function updateFees(): Promise<void> {
    const fees = await getAction(client, estimateFeesPerGas, "estimateFeesPerGas")(args);
    feeRef.fees = fees;
    feeRef.lastUpdatedTimestamp = Date.now();
  }

  return feeRef;
}
