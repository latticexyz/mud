import { Component, Schema, ComponentValue, getComponentValue, componentValueEquals } from "@mudkit/recs";
import { deferred } from "@mudkit/utils";
import { reaction } from "mobx";

function waitForComponentValue<S extends Schema>(
  component: Component<S>,
  entity: string,
  value: Partial<ComponentValue<S>>
): { promise: Promise<void>; dispose: () => void } {
  const [resolve, , promise] = deferred<void>();
  let dispose = resolve;
  dispose = reaction(
    () => getComponentValue(component, entity),
    (currentValue) => {
      if (componentValueEquals(value, currentValue)) {
        resolve();
        dispose();
      }
    },
    { fireImmediately: true }
  );
  return { promise, dispose };
}

export async function waitForComponentValueIn<S extends Schema>(
  component: Component<S>,
  entity: string,
  values: Partial<ComponentValue<S>>[]
): Promise<void> {
  const disposablePromises = values.map((v) => waitForComponentValue(component, entity, v));
  await Promise.any(disposablePromises.map((dp) => dp.promise));
  disposablePromises.forEach((dp) => dp.dispose());
}
