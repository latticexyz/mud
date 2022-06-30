import { map, pipe } from "rxjs";
import { getComponentValueStrict } from "./Component";
import { UpdateType } from "./constants";
import { Component, ComponentUpdate, EntityIndex, Schema } from "./types";

export function isComponentUpdate<S extends Schema>(
  update: ComponentUpdate,
  component: Component<S>
): update is ComponentUpdate<S> {
  return update.component === component;
}

export function toUpdateStream<S extends Schema>(component: Component<S>) {
  return pipe(
    map((entity: EntityIndex) => {
      const value = getComponentValueStrict(component, entity);
      return { entity, component, value: [value, undefined], type: UpdateType.Enter } as ComponentUpdate<S> & {
        type: UpdateType;
      };
    })
  );
}
