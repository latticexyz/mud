import { ZustandStore } from "../zustand";
import { AllTables, Query, QueryResultSubject } from "./common";
import { ResolvedStoreConfig, StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";
import { Observable } from "rxjs";
import isEqual from "fast-deep-equal";

type QueryResultSubjectChange = {
  // TODO: naming
  //       is enter/exit better than add/remove? what about enter/exit vs entered/exited? in/out?
  readonly type: "enter" | "exit";
  readonly subject: QueryResultSubject;
};

type SubscribeToQueryResult<query extends Query> = readonly QueryResultSubjectChange[];

export function subscribeToQuery<
  config extends ResolvedStoreConfig<StoreConfig>,
  extraTables extends Tables | undefined,
>(store: ZustandStore<AllTables<config, extraTables>>, query: Query): Observable<SubscribeToQueryResult<typeof query>> {
  return new Observable<SubscribeToQueryResult<typeof query>>(function subscribe(subscriber) {
    let currentSubjects = findSubjects({
      records: Object.values(store.getState().records),
      query,
    });
    let currentSubjectIds = new Set(currentSubjects.map((subject) => subject.id));
    // TODO: should we check that set size is equal to subject array size?

    // return initial results immediately
    subscriber.next(currentSubjects.map((subject) => ({ type: "enter", subject: subject.subject })));

    // then listen for changes to records and reevaluate
    const unsub = store.subscribe((state, prevState) => {
      if (state.records === prevState.records) return;

      const nextSubjects = findSubjects({
        records: Object.values(state.records),
        query,
      });
      const nextSubjectIds = new Set(nextSubjects.map((subject) => subject.id));
      // TODO: should we check that set size is equal to subject array size?

      if (isEqual(currentSubjectIds, nextSubjectIds)) return;

      const added = nextSubjects
        .filter((subject) => !currentSubjectIds.has(subject.id))
        .map((subject) => ({ type: "enter", subject: subject.subject }) as const);

      const removed = currentSubjects
        .filter((subject) => !nextSubjectIds.has(subject.id))
        .map((subject) => ({ type: "exit", subject: subject.subject }) as const);

      subscriber.next([...removed, ...added]);

      currentSubjects = nextSubjects;
      currentSubjectIds = nextSubjectIds;
    });

    return () => {
      console.log("unsubscribing");
      unsub();
    };
  });
}
