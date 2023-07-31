import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract, waitForTransaction, singletonEntity }: SetupNetworkResult,
  { Counter }: ClientComponents
) {
  const increment = async () => {
    const tx = await worldContract.write.increment({ maxFeePerGas: 0n, maxPriorityFeePerGas: 0n });
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  return {
    increment,
  };
}
