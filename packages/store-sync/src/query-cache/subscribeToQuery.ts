import { ZustandStore } from "../zustand";
import { AllTables, Query, QueryResultSubject } from "./common";
import { ResolvedStoreConfig, StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";
import { Observable, distinctUntilChanged, map, scan } from "rxjs";
import isEqual from "fast-deep-equal";

export type QueryResultSubjectChange = {
  // TODO: naming
  //       is enter/exit better than add/remove? what about enter/exit vs entered/exited? in/out?
  readonly type: "enter" | "exit";
  readonly subject: QueryResultSubject;
};

// TODO: decide if this whole thing is returned in a promise or just `subjects`
type SubscribeToQueryResult<query extends Query> = {
  /**
   * Set of initial matching subjects for query.
   */
  subjects: readonly QueryResultSubject[];
  /**
   * Stream of matching subjects for query. First emission is is the same as `subjects`.
   */
  subjects$: Observable<readonly QueryResultSubject[]>;
  /**
   * Stream of subject changes for query.
   * First emission will be an `enter` for each item in `subjects`, or an empty array if no matches.
   * Each emission after that will only be the subjects that have changed (have entered or exited the result set).
   */
  subjectChanges$: Observable<readonly QueryResultSubjectChange[]>;
};

export async function subscribeToQuery<
  config extends ResolvedStoreConfig<StoreConfig>,
  extraTables extends Tables | undefined,
>(store: ZustandStore<AllTables<config, extraTables>>, query: Query): Promise<SubscribeToQueryResult<typeof query>> {
  const initialRecords = store.getState().records;
  const initialSubjects = findSubjects({
    records: Object.values(initialRecords),
    query,
  });

  function createSubjectStream(): Observable<readonly QueryResultSubject[]> {
    return new Observable<readonly QueryResultSubject[]>(function subscribe(subscriber) {
      // return initial results immediately
      subscriber.next(initialSubjects);

      // if records have changed between query and subscription, reevaluate
      const { records } = store.getState();
      if (records !== initialRecords) {
        subscriber.next(
          findSubjects({
            records: Object.values(records),
            query,
          }),
        );
      }

      // then listen for changes to records and reevaluate
      const unsub = store.subscribe((state, prevState) => {
        if (state.records !== prevState.records) {
          subscriber.next(
            findSubjects({
              records: Object.values(state.records),
              query,
            }),
          );
        }
      });

      return () => void unsub();
    }).pipe(distinctUntilChanged(isEqual));
  }

  const subjects$ = createSubjectStream();

  const subjectChanges$ = createSubjectStream().pipe(
    scan<readonly QueryResultSubject[], { prev: readonly QueryResultSubject[]; curr: readonly QueryResultSubject[] }>(
      (acc, curr) => ({ prev: acc.curr, curr }),
      { prev: [], curr: [] },
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
  );

  return {
    subjects: initialSubjects,
    subjects$,
    subjectChanges$,
  };
}
