import { Stash, applyUpdates } from "@latticexyz/stash/internal";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { computeUpdates } from "./computeUpdates";

export type CreateStorageAdapter = {
  stash: Stash;
};

export function createStorageAdapter({ stash }: CreateStorageAdapter): StorageAdapter {
  return async function storageAdapter(block: StorageAdapterBlock): Promise<void> {
    const updates = computeUpdates({ stash, block });
    applyUpdates({ stash, updates });
  };
}
