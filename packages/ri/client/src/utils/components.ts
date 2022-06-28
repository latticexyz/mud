import { Component, Schema, ComponentValue, componentValueEquals, EntityIndex } from "@latticexyz/recs";
import { deferred } from "@latticexyz/utils";
import { filter } from "rxjs";

export function waitForComponentValueIn<S extends Schema>(
  component: Component<S>,
  entity: EntityIndex,
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

export async function waitForComponentValue<S extends Schema>(
  component: Component<S>,
  entity: EntityIndex,
  value: Partial<ComponentValue<S>>
): Promise<void> {
  await waitForComponentValueIn(component, entity, [value]);
}
