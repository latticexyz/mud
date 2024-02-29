import mudConfig from "../../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog, storeTables, worldTables } from "../../common";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "../../zustand/createStorageAdapter";
import { ZustandStore, createStore } from "../../zustand/createStore";
import { AllTables } from "../common";

const resolvedConfig = resolveConfig(mudConfig);
export const tables = {
  ...resolvedConfig.tables,
  ...storeTables,
  ...worldTables,
} as unknown as AllTables<typeof mudConfig, undefined>;

export async function createHydratedStore(): Promise<ZustandStore<AllTables<typeof mudConfig, undefined>>> {
  const blocks = groupLogsByBlockNumber(
    worldRpcLogs.map((log) => {
      const { eventName, args } = decodeEventLog({
        abi: storeEventsAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
        strict: true,
      });
      return formatLog(log as unknown as RpcLog, {
        args,
        eventName: eventName as string,
      }) as StoreEventsLog;
    })
  );

  const useStore = createStore({ tables });
  const storageAdapter = createStorageAdapter({ store: useStore });

  for (const block of blocks) {
    await storageAdapter(block);
  }

  return useStore;
}
