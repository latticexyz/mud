import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useObservableValue<T>(observable: Observable<T>, defaultValue: T): T;

export function useObservableValue<T>(observable: Observable<T>): T | undefined;

export function useObservableValue<T>(observable: Observable<T>, defaultValue?: T) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
}
