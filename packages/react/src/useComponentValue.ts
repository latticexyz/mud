import {
  Component,
  ComponentValue,
  defineQuery,
  EntityIndex,
  getComponentValue,
  Has,
  isComponentUpdate,
  Metadata,
  Schema,
} from "@latticexyz/recs";
import { useEffect, useState } from "react";

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityIndex: EntityIndex | undefined,
  defaultValue: ComponentValue<S>
): ComponentValue<S>;

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityIndex: EntityIndex | undefined
): ComponentValue<S> | undefined;

export function useComponentValue<S extends Schema>(
  component: Component<S, Metadata, undefined>,
  entityIndex: EntityIndex | undefined,
  defaultValue?: ComponentValue<S>
) {
  const [value, setValue] = useState(entityIndex != null ? getComponentValue(component, entityIndex) : undefined);

  useEffect(() => {
    // component or entityIndex changed, update state to latest value
    setValue(entityIndex != null ? getComponentValue(component, entityIndex) : undefined);
    if (entityIndex == null) return;

    const queryResult = defineQuery([Has(component)], { runOnInit: false });
    const subscription = queryResult.update$.subscribe((update) => {
      if (isComponentUpdate(update, component) && update.entity === entityIndex) {
        const [nextValue] = update.value;
        setValue(nextValue);
      }
    });
    return () => subscription.unsubscribe();
  }, [component, entityIndex]);

  return value ?? defaultValue;
}
