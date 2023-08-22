import { deferred } from "@latticexyz/utils";
import { filter } from "rxjs";
import { componentValueEquals } from "../Component";
import { Component, Metadata, Entity, ComponentValue, Schema } from "../types";

export function waitForComponentValueIn<S extends Schema, T>(
  component: Component<S, Metadata, T>,
  entity: Entity,
  values: Partial<ComponentValue<S>>[]
): Promise<void> {
  const [resolve, , promise] = deferred<void>();

  let dispose = resolve;
  const subscription = component.update$
    .pipe(
      filter((e) => e.entity === entity && Boolean(values.find((value) => componentValueEquals(value, e.value[0]))))
    )
    .subscribe(() => {
      resolve();
      dispose();
    });

  dispose = () => subscription?.unsubscribe();

  return promise;
}
