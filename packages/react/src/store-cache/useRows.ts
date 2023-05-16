import { DatabaseClient, FilterOptions, ScanResult } from "@latticexyz/store-cache";
import { StoreConfig } from "@latticexyz/store";
import { useEffect, useState } from "react";

/**
 * Returns an array of all rows matching the provided filter
 */
export function useRows<C extends StoreConfig, T extends keyof C["tables"] & string>(
  storeCache: DatabaseClient<C>,
  filter?: FilterOptions<C, T>
) {
  const [rows, setRows] = useState<ScanResult<C, T>>([]);

  useEffect(() => {
    setRows(storeCache.scan(filter));

    const unsubscribe = storeCache.subscribe(() => {
      // very naive implementation for now, but easier and probably more efficient than
      // manually looping through the `rows` array for every update event
      setRows(storeCache.scan(filter));
    }, filter);

    return unsubscribe;
  }, []);

  return rows;
}
