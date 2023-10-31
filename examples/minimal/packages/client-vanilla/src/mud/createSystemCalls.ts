import { SetupNetworkResult } from "./setupNetwork";
import { tables } from "./tables";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ useStore, worldContract, waitForTransaction }: SetupNetworkResult) {
  const increment = async () => {
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    return useStore.getState().getRecord(tables.CounterTable, {})?.value.value;
  };

  return {
    increment,
  };
}
