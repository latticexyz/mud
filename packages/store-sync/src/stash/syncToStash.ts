import { Stash } from "@latticexyz/stash/internal";
import { SyncOptions, SyncResult } from "../common";
import { createSyncAdapter } from "./createSyncAdapter";

export type SyncToStashOptions = SyncOptions & {
  stash: Stash;
  startSync?: boolean;
};

export type SyncToStashResult = SyncResult & {
  stopSync: () => void;
};

export async function syncToStash({
  stash,
  startSync = true,
  ...opts
}: SyncToStashOptions): Promise<SyncToStashResult> {
  const sync = await createSyncAdapter({ stash })(opts);

  const sub = startSync ? sync.storedBlockLogs$.subscribe() : null;
  function stopSync(): void {
    sub?.unsubscribe();
  }

  return {
    ...sync,
    stopSync,
  };
}
