import { map, pipe } from "rxjs";
import { getComponentValue } from "./Component";
import { UpdateType } from "./constants";
import { Component, ComponentUpdate, EntityIndex, Schema } from "./types";

export function isComponentUpdate<S extends Schema>(
  update: ComponentUpdate,
  component: Component<S>
): update is ComponentUpdate<S> {
  return update.component === component;
}

export function toUpdate<S extends Schema>(entity: EntityIndex, component: Component<S>) {
  const value = getComponentValue(component, entity);
  return {
    entity,
    component,
    value: [value, undefined],
    type: value == null ? UpdateType.Enter : UpdateType.Noop,
  } as ComponentUpdate<S> & {
    type: UpdateType;
  };
}

export function toUpdateStream<S extends Schema>(component: Component<S>) {
  return pipe(map((entity: EntityIndex) => toUpdate(entity, component)));
}
