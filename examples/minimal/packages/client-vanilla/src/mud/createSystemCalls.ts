import { SetupNetworkResult } from "./setupNetwork";
import { tables } from "./tables";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ useStore, worldContract, waitForTransaction }: SetupNetworkResult) {
  const increment = async () => {
    const tx = await worldContract.write.increment();
    await waitForTransaction(tx);
    // TODO: improve with table specific helper
    const record = Object.values(useStore.getState().records).find(
      (record) => record.table.tableId === tables.CounterTable.tableId && record.keyTuple.length === 0
    ) as any;
    return record.value.value;
  };

  return {
    increment,
  };
}
