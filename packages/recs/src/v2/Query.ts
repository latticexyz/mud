import { Subject } from "rxjs";
import { Component, Entity } from "./types";

// Queries could keep an internal set of entities currently matching
// the query. If it currently matches, then we only need to check the current
// update to see if it still matches.
// If it didn't match before, that means we have to recheck all fragments
// (Unless we want to keep track of for which component it matched before)
export function defineUpdateQuery(fragments: Component[]) {
  const result$ = new Subject<Entity>();

  for (const fragment of fragments) {
    fragment.update$.subscribe((e) => result$.next(e.entity));
  }

  return result$;
}
