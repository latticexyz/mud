import { DatabaseClient, FilterOptions, ScanResult } from "@latticexyz/store-cache";
import { StoreConfig } from "@latticexyz/store";
import { useEffect, useState } from "react";
import { useDeepMemo } from "../utils/useDeepMemo";

/**
 * Returns an array of all rows matching the provided filter
 */
export function useRows<C extends StoreConfig, T extends keyof C["tables"] & string>(
  storeCache: DatabaseClient<C>,
  filter?: FilterOptions<C, T>
) {
  const [rows, setRows] = useState<ScanResult<C, T>>([]);
  const filterMemo = useDeepMemo(filter);

  useEffect(() => {
    let unsubscribe: () => void;

    (async () => {
      setRows(await storeCache.scan(filterMemo));

      unsubscribe = await storeCache.subscribe(async () => {
        // very naive implementation for now, but easier and probably more efficient than
        // manually looping through the `rows` array for every update event
        setRows(await storeCache.scan(filterMemo));
      }, filterMemo);
    })();

    return () => unsubscribe?.();
  }, [filterMemo, storeCache]);

  return rows;
}
