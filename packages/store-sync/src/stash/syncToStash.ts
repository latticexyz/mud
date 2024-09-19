import { getRecord, setRecord, registerTable, Stash } from "@latticexyz/stash/internal";
import { Address, Client, publicActions } from "viem";
import { createStorageAdapter } from "./createStorageAdapter";
import { defineTable } from "@latticexyz/store/config/v2";
import { SyncStep } from "../SyncStep";
import { SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";

export const SyncProgress = defineTable({
  namespaceLabel: "syncToStash",
  label: "SyncProgress",
  schema: {
    step: "string",
    percentage: "uint32",
    latestBlockNumber: "uint256",
    lastBlockNumberProcessed: "uint256",
    message: "string",
  },
  key: [],
});

export const initialProgress = {
  step: SyncStep.INITIALIZE,
  percentage: 0,
  latestBlockNumber: 0n,
  lastBlockNumberProcessed: 0n,
  message: "Connecting",
} satisfies getSchemaPrimitives<getValueSchema<typeof SyncProgress>>;

export type SyncToStashOptions = {
  stash: Stash;
  client: Client;
  address: Address;
  startSync?: boolean;
};

export type SyncToStashResult = Omit<SyncResult, "waitForTransaction"> & {
  waitForStateChange: SyncResult["waitForTransaction"];
  stopSync: () => void;
};

export async function syncToStash({
  stash,
  client,
  address,
  startSync = true,
}: SyncToStashOptions): Promise<SyncToStashResult> {
  registerTable({ stash, table: SyncProgress });

  const storageAdapter = createStorageAdapter({ stash });

  const { waitForTransaction: waitForStateChange, ...sync } = await createStoreSync({
    storageAdapter,
    publicClient: client.extend(publicActions) as never,
    address,
    onProgress: (nextValue) => {
      const currentValue = getRecord({ stash, table: SyncProgress, key: {} });
      // update sync progress until we're caught up and live
      if (currentValue?.step !== SyncStep.LIVE) {
        setRecord({ stash, table: SyncProgress, key: {}, value: nextValue });
      }
    },
  });

  const sub = startSync ? sync.storedBlockLogs$.subscribe() : null;
  function stopSync(): void {
    sub?.unsubscribe();
  }

  return {
    ...sync,
    waitForStateChange,
    stopSync,
  };
}
