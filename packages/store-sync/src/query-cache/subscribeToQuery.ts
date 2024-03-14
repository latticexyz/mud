import { Observable } from "rxjs";
import { SubjectEvent, SubjectRecord, SubjectRecords, findSubjects } from "@latticexyz/query";
import { Query } from "./common";
import { QueryCacheStore } from "./createStore";
import { queryToWire } from "./queryToWire";

function getId({ subject, record }: SubjectRecord): string {
  // TODO: memoize
  return JSON.stringify([subject, record.primaryKey]);
}

function flattenSubjectRecords(subjects: readonly SubjectRecords[]): readonly SubjectRecord[] {
  return subjects.flatMap((subject) =>
    subject.records.map((record) => ({
      subject: subject.subject,
      record,
    })),
  );
}

function subjectEvents(prev: readonly SubjectRecord[], next: readonly SubjectRecord[]): readonly SubjectEvent[] {
  const prevSet = new Set(prev.map((record) => getId(record)));
  const nextSet = new Set(next.map((record) => getId(record)));

  const enters = next.filter((record) => !prevSet.has(getId(record)));
  const exits = prev.filter((record) => !nextSet.has(getId(record)));
  const changes = next.filter((nextRecord) => {
    const prevRecord = prev.find((record) => getId(record) === getId(nextRecord));
    // TODO: improve this so we're not dependent on field order
    return prevRecord && JSON.stringify(prevRecord.record.fields) !== JSON.stringify(nextRecord.record.fields);
  });

  return [
    ...enters.map((record) => ({ ...record, type: "enter" as const })),
    ...exits.map((record) => ({ ...record, type: "exit" as const })),
    ...changes.map((record) => ({ ...record, type: "change" as const })),
  ];
}

// TODO: decide if this whole thing is returned in a promise or just `subjects`
// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects
// TODO: stronger types
export type SubscribeToQueryResult = {
  /**
   * Set of initial matching subjects for query.
   */
  subjects: Promise<readonly SubjectRecords[]>;
  /**
   * Stream of subject changes for query.
   * First emission will be an `enter` for each item in `subjects`, or an empty array if no matches.
   * Each emission after that will only be the subjects that have changed (entered/exited the result set, or the underlying record changed).
   */
  subjects$: Observable<readonly SubjectEvent[]>;
};

export function subscribeToQuery<store extends QueryCacheStore, query extends Query>(
  store: store,
  query: query,
): SubscribeToQueryResult {
  const { tables, records: initialTableRecords } = store.getState();
  const wireQuery = queryToWire(tables, query);
  const initialSubjects = findSubjects({
    records: Object.values(initialTableRecords),
    query: wireQuery,
  });

  function createSubjectStream(): Observable<readonly SubjectEvent[]> {
    return new Observable<readonly SubjectEvent[]>(function subscribe(subscriber) {
      // return initial results immediately
      const initialRecords: readonly SubjectRecord[] = flattenSubjectRecords(initialSubjects);
      subscriber.next(subjectEvents([], initialRecords));

      let previousRecords = initialRecords;

      // if records have changed between query and subscription, reevaluate
      const { records: tableRecords } = store.getState();
      if (tableRecords !== initialTableRecords) {
        const nextSubjectRecords = flattenSubjectRecords(
          findSubjects({
            records: Object.values(tableRecords),
            query: wireQuery,
          }),
        );
        const events = subjectEvents(previousRecords, nextSubjectRecords);
        if (events.length) {
          subscriber.next(events);
          previousRecords = nextSubjectRecords;
        }
      }

      // then listen for changes to records and reevaluate
      const unsub = store.subscribe((state, prevState) => {
        if (state.records !== prevState.records) {
          const nextSubjectRecords = flattenSubjectRecords(
            findSubjects({
              records: Object.values(state.records),
              query: wireQuery,
            }),
          );
          const events = subjectEvents(previousRecords, nextSubjectRecords);
          if (events.length) {
            subscriber.next(events);
            previousRecords = nextSubjectRecords;
          }
        }
      });

      return () => void unsub();
    });
  }

  const subjects$ = createSubjectStream();

  return {
    subjects: new Promise((resolve) => resolve(initialSubjects)),
    subjects$,
  };
}
