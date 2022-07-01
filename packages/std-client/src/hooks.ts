import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useStream<T>(stream: Observable<T>, defaultValue?: T) {
  const [state, setState] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const sub = stream.subscribe((newState) => setState(newState));
    return () => sub.unsubscribe();
  }, []);

  return state;
}
