import { defineQuery, QueryFragment } from "@latticexyz/recs";
import { useEffect, useMemo, useState } from "react";
import { useDeepMemo } from "./utils/useDeepMemo";
import isEqual from "fast-deep-equal";
import { distinctUntilChanged, map } from "rxjs";

// This does a little more rendering than is necessary when arguments change,
// but at least it's giving correct results now. Will optimize later!

/**
 * Returns all matching `EntityIndex`es for a given entity query,
 * and triggers a re-render as new query results come in.
 *
 * @param fragments Query fragments to match against, executed from left to right.
 * @param options.updateOnValueChange False - re-renders only on entity array changes. True (default) - also on component value changes.
 * @returns Set of entities matching the query fragments.
 */
export function useEntityQuery(fragments: QueryFragment[], options?: { updateOnValueChange?: boolean }) {
  const updateOnValueChange = options?.updateOnValueChange ?? true;

  const stableFragments = useDeepMemo(fragments);
  const query = useMemo(() => defineQuery(stableFragments, { runOnInit: true }), [stableFragments]);
  const [entities, setEntities] = useState([...query.matching]);

  useEffect(() => {
    setEntities([...query.matching]);
    let observable = query.update$.pipe(map(() => [...query.matching]));
    if (!updateOnValueChange) {
      // re-render only on entity array changes
      observable = observable.pipe(distinctUntilChanged((a, b) => isEqual(a, b)));
    }
    const subscription = observable.subscribe((entities) => setEntities(entities));
    return () => subscription.unsubscribe();
  }, [query, updateOnValueChange]);

  return entities;
}
