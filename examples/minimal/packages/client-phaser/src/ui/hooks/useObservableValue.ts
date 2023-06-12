import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useObservableValue<T>(observable: Observable<T> | null | undefined): T | undefined;
export function useObservableValue<T>(observable: Observable<T> | null | undefined, defaultValue: T): T;

export function useObservableValue<T>(observable: Observable<T> | null | undefined, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(defaultValue);
  useEffect(() => {
    if (!observable) return;
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [observable]);
  return value;
}
