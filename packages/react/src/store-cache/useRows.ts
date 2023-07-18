import { DatabaseClient, FilterOptions, ScanResult } from "@latticexyz/store-cache";
import { StoreConfig } from "@latticexyz/store";
import { useEffect, useState } from "react";
import { useDeepMemo } from "../utils/useDeepMemo";
import { useMountedState } from "../utils/useMountedState";

/**
 * Returns an array of all rows matching the provided filter
 */
export function useRows<C extends StoreConfig, T extends keyof C["tables"] & string>(
  storeCache: DatabaseClient<C>,
  filter?: FilterOptions<C, T> | undefined
) {
  const [rows, setRows] = useMountedState<ScanResult<C, T>>([]);
  const filterMemo = useDeepMemo(filter);

  useEffect(() => {
    storeCache.scan(filterMemo).then(setRows);

    const unsubscribePromise = storeCache.subscribe(() => {
      // very naive implementation for now, but easier and probably more efficient than
      // manually looping through the `rows` array for every update event
      storeCache.scan(filterMemo).then(setRows);
    }, filterMemo);

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [filterMemo, setRows, storeCache]);

  return rows;
}
