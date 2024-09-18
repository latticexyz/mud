import { World } from "@latticexyz/world";
import { Address, Client, publicActions } from "viem";
import { defineTable } from "@latticexyz/store/config/v2";
import { CreateStoreResult } from "@latticexyz/stash/internal";
import { createStorageAdapter } from "./createStorageAdapter";
import { SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { SyncStep } from "../SyncStep";

export const SyncProgress = defineTable({
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

export type SyncToStashOptions<config extends World> = {
  config: config;
  stash: CreateStoreResult;
  client: Client;
  address: Address;
};

export async function syncToStash<const config extends World>({
  config,
  stash,
  client,
  address,
}: SyncToStashOptions<config>): Promise<SyncResult> {
  return createStoreSync({
    storageAdapter: createStorageAdapter({ config, stash }),
    publicClient: client.extend(publicActions) as never,
    address,
    onProgress: ({ step, percentage, latestBlockNumber, lastBlockNumberProcessed, message }) => {
      // already live, no need for more progress updates
      if (stash.getRecord({ table: SyncProgress, key: {} })?.step === SyncStep.LIVE) {
        return;
      }

      stash.setRecord({
        table: SyncProgress,
        key: {},
        value: {
          step,
          percentage,
          latestBlockNumber,
          lastBlockNumberProcessed,
          message,
        },
      });
    },
  });
}
