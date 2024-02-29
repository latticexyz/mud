import { Component, Schema } from "@latticexyz/recs";
import { StoreComponentMetadata } from "./common";

export function isStoreComponent<S extends Schema = Schema>(
  component: Component<S>
): component is Component<S, StoreComponentMetadata> {
  return (
    component.metadata?.componentName != null &&
    component.metadata?.tableName != null &&
    component.metadata?.keySchema != null &&
    component.metadata?.valueSchema != null
  );
}
