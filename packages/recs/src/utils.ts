import { Component, ComponentUpdate, Schema } from "./types";

export function isComponentUpdate<S extends Schema>(
  update: ComponentUpdate,
  component: Component<S>
): update is ComponentUpdate<S> {
  return update.component === component;
}
