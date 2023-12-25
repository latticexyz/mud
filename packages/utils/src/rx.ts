import {
  BehaviorSubject,
  concatMap,
  delay,
  filter,
  first,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  pipe,
  scan,
  Timestamp,
  timestamp,
} from "rxjs";
import { deferred } from "./deferred";

export function filterNullish<T>(): OperatorFunction<T, NonNullable<T>> {
  return pipe<Observable<T>, Observable<NonNullable<T>>>(
    filter<T>((x: T) => x != null) as OperatorFunction<T, NonNullable<T>>
  );
}

export function awaitPromise<T extends Promise<unknown>>(): OperatorFunction<T, Awaited<T>> {
  return pipe(concatMap((x: T) => x)) as OperatorFunction<T, Awaited<T>>;
}

/**
 * RxJS operator to stretch out an event stream by a given delay per event
 * @param spacingDelayMs Delay between each event in ms
 * @returns stream of events with at least spacingDelayMs spaceing between event
 */
export function stretch<T>(spacingDelayMs: number) {
  return pipe(
    timestamp<T>(),
    scan((acc: (Timestamp<T> & { delay: number }) | null, curr: Timestamp<T>) => {
      // calculate delay needed to offset next emission
      let delay = 0;
      if (acc !== null) {
        const timeDelta = curr.timestamp - acc.timestamp;
        delay = timeDelta > spacingDelayMs ? 0 : spacingDelayMs - timeDelta;
      }

      return {
        timestamp: curr.timestamp,
        delay: delay,
        value: curr.value,
      };
    }, null),
    filterNullish(),
    mergeMap((i) => of(i.value).pipe(delay(i.delay)), 1)
  );
}

export function observableToBehaviorSubject<T>(obs: T): BehaviorSubject<T> {
  return new BehaviorSubject<T>(obs);
}

export function valueToStream<T>(value: T): Observable<T> {
  return new Observable<T>((observer) => {
    observer.next(value);
    observer.complete();
  });
}

export function streamToBehaviorSubject<T>(stream$: Observable<T>): BehaviorSubject<T | undefined> {
  const subject = new BehaviorSubject<T | undefined>(undefined);
  stream$.subscribe((val) => subject.next(val));
  return subject;
}

export function streamToDefinedBehaviorSubject<T>(stream$: Observable<T>): BehaviorSubject<T> {
  const subject = new BehaviorSubject<T>(undefined as unknown as T);
  stream$.subscribe((val) => subject.next(val));
  return subject;
}

/**
 *
 * @param stream$ RxJS observable to check for the given value
 * @param predicate Predicate to check
 * @returns A promise that resolves with the requested value once the predicate is true
 */
export async function awaitStreamValue<T>(
  stream$: Observable<T>,
  predicate: (value: T) => boolean = (value) => value != null
): Promise<T> {
  const [resolve, , promise] = deferred<T>();
  stream$.pipe(first(predicate)).subscribe(resolve);
  return promise;
}

/**
 * Turns a stream into an updating object for easy access outside of rxjs
 * @param stream$ Stream to turn into a wrapped value
 * @returns Object with `current` key corresponding to last stream value
 */
export async function streamToWrappedValue<T>(stream$: Observable<T>): Promise<{ current: T }> {
  const value: { current?: T } = {};
  stream$.subscribe((v) => (value.current = v));
  value.current = await awaitStreamValue(stream$);
  return value as { current: T };
}
