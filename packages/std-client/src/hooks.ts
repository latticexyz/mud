import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useStream<T>(stream: Observable<T>) {
  const [state, setState] = useState<T>();

  useEffect(() => {
    const sub = stream.subscribe((newState) => setState(newState));
    return () => sub.unsubscribe();
  }, []);

  return state;
}
