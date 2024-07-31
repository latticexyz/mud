import { recordToLog, StorageAdapterBlock } from "@latticexyz/store-sync";
import { DozerTableQuery, fetchRecordsDozerSql } from "@latticexyz/store-sync/dozer";
import { createStorageAdapter } from "@latticexyz/store-sync/zustand-query";
import { Store } from "@latticexyz/zustand-query/internal";
import { Hex } from "viem";

type SyncOptions = {
  dozerUrl: string;
  storeAddress: Hex;
  queries: DozerTableQuery[];
  store: Store;
};

export async function sync({ dozerUrl, storeAddress, queries, store }: SyncOptions) {
  const initialStorageAdapterBlock: StorageAdapterBlock = {
    blockNumber: 0n,
    logs: [],
  };

  console.log("Fetching from dozer");
  const dozerTables = await fetchRecordsDozerSql({
    url: dozerUrl,
    address: storeAddress,
    queries,
  });

  console.log("dozer tables", dozerTables);
  for (const row of dozerTables?.result ?? []) {
    console.log(row);
  }

  console.log("num matches", dozerTables?.result[0].records.length);

  if (dozerTables) {
    // TODO: take min block height of all subqueries
    initialStorageAdapterBlock.blockNumber = dozerTables.blockHeight;
    initialStorageAdapterBlock.logs = dozerTables.result.flatMap(({ table, records }) =>
      records.map((record) => recordToLog({ table, record, address: storeAddress })),
    );
  }

  console.log("initial storage adapter block", initialStorageAdapterBlock);

  const { storageAdapter } = createStorageAdapter({ store });
  storageAdapter(initialStorageAdapterBlock);
}
