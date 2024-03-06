import { Observable } from "rxjs";

export function observe<T>(observable: Observable<T>): {
  readonly values: readonly T[];
  readonly length: number;
  readonly lastValue: T | undefined;
  readonly unsubscribe: () => void;
} {
  const values: T[] = [];
  const sub = observable.subscribe((value) => values.push(value));
  return {
    values,
    get length(): number {
      return values.length;
    },
    get lastValue(): T | undefined {
      return values[values.length - 1];
    },
    unsubscribe(): void {
      sub.unsubscribe();
    },
  };
}
