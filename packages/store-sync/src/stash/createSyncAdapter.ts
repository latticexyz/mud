import { getRecord, setRecord, registerTable, Stash } from "@latticexyz/stash/internal";
import { createStorageAdapter } from "./createStorageAdapter";
import { SyncStep } from "../SyncStep";
import { SyncAdapter } from "../common";
import { createStoreSync } from "../createStoreSync";
import { SyncProgress } from "./common";

export type CreateSyncAdapterOptions = { stash: Stash };

export function createSyncAdapter({ stash }: CreateSyncAdapterOptions): SyncAdapter {
  return (opts) => {
    // TODO: clear stash?

    registerTable({ stash, table: SyncProgress });

    const storageAdapter = createStorageAdapter({ stash });

    return createStoreSync({
      ...opts,
      storageAdapter,
      onProgress: (nextValue) => {
        const currentValue = getRecord({ stash, table: SyncProgress, key: {} });
        // update sync progress until we're caught up and live
        if (currentValue?.step !== SyncStep.LIVE) {
          setRecord({ stash, table: SyncProgress, key: {}, value: nextValue });
        }
      },
    });
  };
}
