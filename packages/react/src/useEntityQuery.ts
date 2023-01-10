import { defineQuery } from "@latticexyz/recs";
import { useEffect, useState } from "react";

export function useEntityQuery(...args: Parameters<typeof defineQuery>) {
  const [fragments, options = { runOnInit: true }] = args;

  const queryResult = defineQuery(fragments, options);
  const [value, setValue] = useState([...queryResult.matching]);

  useEffect(() => {
    if (options.runOnInit) {
      setValue([...queryResult.matching]);
    }
    const subscription = queryResult.update$.subscribe(() => setValue([...queryResult.matching]));
    return () => subscription.unsubscribe();
  }, [queryResult.update$, queryResult.matching, options.runOnInit]);

  return value;
}
