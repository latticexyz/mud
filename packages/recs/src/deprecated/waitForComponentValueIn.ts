import { deferred } from "@latticexyz/utils";
import { filter, map, startWith } from "rxjs";
import { componentValueEquals, getComponentValue } from "../Component";
import { Component, Metadata, Entity, ComponentValue, Schema } from "../types";

export function waitForComponentValueIn<S extends Schema, T>(
  component: Component<S, Metadata, T>,
  entity: Entity,
  values: Partial<ComponentValue<S>>[]
): Promise<void> {
  const [resolve, , promise] = deferred<void>();

  const currentValue = getComponentValue(component, entity);
  if (values.find((value) => componentValueEquals(value, currentValue))) {
    resolve();
  }

  let dispose = resolve;

  const value$ = component.update$.pipe(
    filter((update) => update.entity === entity), // Ignore updates of other entities
    map((update) => update.value[0]) // Map the update to the current value
  );

  const subscription = value$
    .pipe(
      startWith(getComponentValue(component, entity)),
      filter((currentValue) => Boolean(values.find((searchValue) => componentValueEquals(searchValue, currentValue))))
    )
    .subscribe(() => {
      resolve();
      dispose();
    });

  dispose = () => subscription?.unsubscribe();

  return promise;
}
