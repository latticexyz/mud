import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract, waitForTransaction }: SetupNetworkResult,
  { Counter }: ClientComponents
) {
  const increment = async () => {
    // TODO: fix anvil issue where accounts can't send txs unless max fee is specified or is funded
    // const tx = await worldContract.write.increment({ maxFeePerGas: 0n, maxPriorityFeePerGas: 0n });
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  return {
    increment,
  };
}
