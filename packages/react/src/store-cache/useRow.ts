import { StoreConfig } from "@latticexyz/store";
import { DatabaseClient, Key, ScanResult } from "@latticexyz/store-cache";
import { useRows } from "./useRows";

export type UseRowFilterOptions<
  C extends StoreConfig = StoreConfig,
  T extends keyof C["tables"] & string = keyof C["tables"] & string
> = {
  namespace?: C["namespace"];
  table: T;
  key: Key<C, T>;
};

/**
 * Returns a single row of a given table at the given key, updates when the key changes
 */
export function useRow<C extends StoreConfig, T extends keyof C["tables"] & string>(
  storeCache: DatabaseClient<C>,
  filter: UseRowFilterOptions<C, T>
): ScanResult<C, T>[0] | undefined {
  const { namespace, table, key } = filter;
  return useRows(storeCache, { namespace, table, key: { eq: key } })[0];
}
