import { StoreConfig } from "@latticexyz/store";
import { DatabaseClient, Key, ScanResult } from "@latticexyz/store-cache";
import { useRows } from "./useRows";

export function useRow<C extends StoreConfig, T extends keyof C["tables"] & string>(
  storeCache: DatabaseClient<C>,
  namespace: C["namespace"],
  table: T,
  key: Key<C, T>
): ScanResult<C, T>[0] | undefined {
  return useRows(storeCache, { namespace, table, key: { eq: key } })[0];
}
