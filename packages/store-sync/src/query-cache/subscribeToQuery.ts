import { ZustandStore } from "../zustand";
import { AllTables, Query, QueryResult } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";
import { Observable, distinctUntilChanged } from "rxjs";
import isEqual from "fast-deep-equal";

export function subscribeToQuery<config extends StoreConfig, extraTables extends Tables | undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query
): Observable<QueryResult<typeof query>> {
  return new Observable(function subscribe(subscriber) {
    // return initial results immediately
    subscriber.next(
      findSubjects({
        records: Object.values(store.getState().records),
        query,
      })
    );

    // then listen for changes to records and reevaluate
    return store.subscribe((state, prevState) => {
      if (state.records === prevState.records) return;

      subscriber.next(
        findSubjects({
          records: Object.values(state.records),
          query,
        })
      );
    });
  }).pipe(distinctUntilChanged(isEqual));
}
