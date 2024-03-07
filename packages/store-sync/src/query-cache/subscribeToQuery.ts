import { ZustandStore } from "../zustand";
import { AllTables, Query, QueryResultSubject } from "./common";
import { ResolvedStoreConfig, StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";
import { Observable, distinctUntilChanged, filter, map, scan } from "rxjs";
import isEqual from "fast-deep-equal";

type QueryResultSubjectChange = {
  // TODO: naming
  //       is enter/exit better than add/remove? what about enter/exit vs entered/exited? in/out?
  readonly type: "enter" | "exit";
  readonly subject: QueryResultSubject;
};

type SubscribeToQueryResult<query extends Query> = Observable<readonly QueryResultSubjectChange[]>;

export function subscribeToQuery<
  config extends ResolvedStoreConfig<StoreConfig>,
  extraTables extends Tables | undefined,
>(store: ZustandStore<AllTables<config, extraTables>>, query: Query): SubscribeToQueryResult<typeof query> {
  const subjects$ = new Observable<readonly QueryResultSubject[]>(function subscribe(subscriber) {
    // return initial results immediately
    subscriber.next(
      findSubjects({
        records: Object.values(store.getState().records),
        query,
      }),
    );

    // then listen for changes to records and reevaluate
    const unsub = store.subscribe((state, prevState) => {
      if (state.records === prevState.records) return;

      subscriber.next(
        findSubjects({
          records: Object.values(state.records),
          query,
        }),
      );
    });

    return () => {
      console.log("unsubscribing");
      unsub();
    };
  });

  const subjectChanges$ = subjects$.pipe(
    scan<readonly QueryResultSubject[], { prev: readonly QueryResultSubject[]; curr: readonly QueryResultSubject[] }>(
      (acc, curr) => ({ prev: acc.curr, curr }),
      {
        prev: [] as readonly QueryResultSubject[],
        curr: [] as readonly QueryResultSubject[],
      },
    ),
    map(({ prev, curr }) => {
      const prevSet = new Set(prev.map((subject) => JSON.stringify(subject)));
      const currSet = new Set(curr.map((subject) => JSON.stringify(subject)));

      const enter = curr.filter((subject) => !prevSet.has(JSON.stringify(subject)));
      const exit = prev.filter((subject) => !currSet.has(JSON.stringify(subject)));

      return [
        ...enter.map((subject) => ({ type: "enter" as const, subject })),
        ...exit.map((subject) => ({ type: "exit" as const, subject })),
      ];
    }),
    filter((changes) => changes.length > 0), // Filter out empty change sets
  );

  return subjectChanges$;
}
