import { Component, EntityIndex, Schema, toUpdate } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { filter, Observable } from "rxjs";

export function useStream<T>(stream: Observable<T>, defaultValue?: T) {
  const [state, setState] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const sub = stream.subscribe((newState) => setState(newState));
    return () => sub.unsubscribe();
  }, []);

  return state;
}

export function useComponentValueStream<T extends Schema>(component: Component<T>, entity?: EntityIndex) {
  let stream = component.update$.asObservable();
  if (entity) {
    stream = stream.pipe(filter((c) => c.entity === entity));
  }

  const update = useStream(stream, entity && toUpdate(entity, component));
  if (!update) return null;
  return update.value[0];
}
