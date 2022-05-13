import { BehaviorSubject, filter, first, Observable, OperatorFunction, pipe, UnaryFunction } from "rxjs";
import { computed, IComputedValue, observable, reaction, runInAction } from "mobx";
import { deferred } from "./deferred";

export function filterNullish<T>(): UnaryFunction<Observable<T | null | undefined>, Observable<T>> {
  return pipe(filter((x) => x != null) as OperatorFunction<T | null | undefined, T>);
}

export function computedToStream<T>(comp: IComputedValue<T>): Observable<T> {
  const stream = new BehaviorSubject(comp.get());
  reaction(
    () => comp.get(),
    (value) => stream.next(value)
  );
  return stream;
}

export function streamToComputed<T>(stream: Observable<T>): IComputedValue<T | undefined> {
  const value = observable<{ current: T | undefined }>({ current: undefined });
  stream.subscribe((val) => runInAction(() => (value.current = val)));
  return computed(() => value.current);
}

/**
 *
 * @param stream RxJS observable to check for the given value
 * @param predicate Predicate to check
 * @returns A promise that resolves with the requested value once the predicate is true
 */
export async function awaitStreamValue<T>(stream$: Observable<T>, predicate: (value: T) => boolean): Promise<T> {
  const [resolve, , promise] = deferred<T>();
  stream$.pipe(first(predicate)).subscribe(resolve);
  return promise;
}
