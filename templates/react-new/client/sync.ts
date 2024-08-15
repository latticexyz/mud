import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { DozerSyncFilter, fetchInitialBlockLogsDozer } from "@latticexyz/store-sync/dozer";
import { createStorageAdapter } from "@latticexyz/store-sync/stash";
import { Store } from "@latticexyz/stash/internal";
import { Hex } from "viem";

type SyncOptions = {
  dozerUrl: string;
  storeAddress: Hex;
  filters: DozerSyncFilter[];
  store: Store;
};

export async function sync({ dozerUrl, storeAddress, filters, store }: SyncOptions) {
  const initialStorageAdapterBlock: StorageAdapterBlock = {
    blockNumber: 0n,
    logs: [],
  };

  console.log("Fetching from dozer");
  const { initialBlockLogs } = await fetchInitialBlockLogsDozer({ dozerUrl, storeAddress, filters, chainId: 690 });

  console.log("initial storage adapter block", initialStorageAdapterBlock);

  const { storageAdapter } = createStorageAdapter({ store });
  storageAdapter(initialBlockLogs);
}
