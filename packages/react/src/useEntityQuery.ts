import { defineQuery, QueryFragment } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useDeepMemo } from "./utils/useDeepMemo";
import isEqual from "fast-deep-equal";
import { distinctUntilChanged, map } from "rxjs";

// This does a little more rendering than is necessary when arguments change,
// but at least it's giving correct results now. Will optimize later!

export function useEntityQuery(fragments: QueryFragment[]) {
  const stableFragments = useDeepMemo(fragments);
  const query = useMemo(() => defineQuery(stableFragments, { runOnInit: true }), [stableFragments]);
  const [entities, setEntities] = useState([...query.matching]);

  useEffect(() => {
    setEntities([...query.matching]);
    const subscription = query.update$
      .pipe(map(() => [...query.matching]))
      .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
      .subscribe((entities) => setEntities(entities));
    return () => subscription.unsubscribe();
  }, [query]);

  return entities;
}
