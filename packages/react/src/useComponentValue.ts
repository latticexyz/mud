import { Component, ComponentValue, EntityIndex, getComponentValue, Has, Metadata, Schema } from "@latticexyz/recs";
import { useMemo } from "react";
import { useEntityQuery } from "./useEntityQuery";

export function useComponentValue<S extends Schema>(
  entityIndex: EntityIndex | undefined,
  component: Component<S, Metadata, undefined>,
  defaultValue: ComponentValue<S>
): ComponentValue<S>;

export function useComponentValue<S extends Schema>(
  entityIndex: EntityIndex | undefined,
  component: Component<S, Metadata, undefined>
): ComponentValue<S> | undefined;

export function useComponentValue<S extends Schema>(
  entityIndex: EntityIndex | undefined,
  component: Component<S, Metadata, undefined>,
  defaultValue?: ComponentValue<S>
) {
  const entities = useEntityQuery(useMemo(() => [Has(component)], [component]));
  if (entityIndex == null) {
    return defaultValue;
  }
  if (!entities.includes(entityIndex)) {
    return defaultValue;
  }
  const value = getComponentValue(component, entityIndex);
  if (value == null) {
    console.warn("Unexpected null/undefined value for component", component, entityIndex);
    return defaultValue;
  }
  return value;
}
