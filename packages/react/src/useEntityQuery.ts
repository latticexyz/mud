import { defineQuery } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";

type Args = Parameters<typeof defineQuery>;
const defaultOptions: NonNullable<Args[1]> = { runOnInit: true };

export function useEntityQuery(...args: Args) {
  const [fragments, options = defaultOptions] = args;

  const queryResult = useMemo(() => defineQuery(fragments, options), [fragments, options]);
  const [value, setValue] = useState([...queryResult.matching]);

  useEffect(() => {
    // If query changes, we need to update state (initialState is only set once)
    if (options.runOnInit) {
      setValue([...queryResult.matching]);
    }
    const subscription = queryResult.update$.subscribe(() => setValue([...queryResult.matching]));
    return () => subscription.unsubscribe();
  }, [queryResult, options.runOnInit]);

  return value;
}
