import {
  BehaviorSubject,
  concat,
  concatMap,
  delay,
  EMPTY,
  filter,
  first,
  identity,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  pipe,
  scan,
  Timestamp,
  timestamp,
  UnaryFunction,
  withLatestFrom,
} from "rxjs";
import { computed, IComputedValue, IObservableValue, observable, reaction, runInAction, toJS } from "mobx";
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

export function stretch2<T>(spacingDelayMs: number) {
  return pipe(concatMap<T, Observable<T>>((e) => concat(of(e), EMPTY.pipe(delay(spacingDelayMs)))));
}

export function observableToComputed<T>(obs: IObservableValue<T>): IComputedValue<T> {
  return computed(() => obs.get());
}

export function computedToStream<T>(comp: IComputedValue<T>): Observable<T> {
  const stream = new BehaviorSubject(comp.get());
  reaction(
    () => comp.get(),
    (value) => stream.next(value)
  );
  return stream;
}

export function observableToStream<T>(obs: T): Observable<T> {
  const stream = new BehaviorSubject(toJS(obs));
  reaction(
    () => toJS(obs),
    (value) => stream.next(value)
  );
  return stream;
}

export function streamToComputed<T>(stream$: Observable<T>): IComputedValue<T | undefined> {
  const value = observable.box<T | undefined>();
  stream$.subscribe((val) => runInAction(() => value.set(val)));
  return computed(() => value.get());
}

/**
 *
 * @param stream$ RxJS observable to check for the given value
 * @param predicate Predicate to check
 * @returns A promise that resolves with the requested value once the predicate is true
 */
export async function awaitStreamValue<T>(stream$: Observable<T>, predicate: (value: T) => boolean): Promise<T> {
  const [resolve, , promise] = deferred<T>();
  stream$.pipe(first(predicate)).subscribe(resolve);
  return promise;
}
