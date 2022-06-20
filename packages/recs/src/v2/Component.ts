import { uuid } from "@latticexyz/utils";
import { mapObject } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { Component, ComponentValue, Entity, Schema } from "./types";

export function defineComponent<S extends Schema>(schema: S, options?: { id: string }) {
  const id = options?.id ?? uuid();
  const values = mapObject(schema, () => new Map());
  const update$ = new Subject();
  return { values, schema, id, update$ } as Component<S>;
}

export function setComponent<S extends Schema>(component: Component<S>, entity: number, value: ComponentValue<S>) {
  const prevValue = getComponentValue(component, entity);
  for (const [key, val] of Object.entries(value)) {
    component.values[key].set(entity, val);
  }
  component.update$.next({ entity, value: [value, prevValue] });
}

export function withValue<S extends Schema>(
  component: Component<S>,
  value: ComponentValue<S>
): [Component<S>, ComponentValue<S>] {
  return [component, value];
}

export function getComponentValue<S extends Schema>(component: Component<S>, entity: Entity) {
  const value: Record<string, unknown> = {};

  // Get the value of each schema key
  const schemaKeys = Object.keys(component.schema);
  for (const key of schemaKeys) {
    const val = component.values[key].get(entity);
    if (val === undefined) return undefined;
    value[key] = val;
  }

  return value as ComponentValue<S>;
}
