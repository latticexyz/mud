import {
  Component,
  ComponentValue,
  defineQuery,
  EntityIndex,
  getComponentValue,
  Has,
  Metadata,
  Schema,
} from "@latticexyz/recs";
import { useEffect, useState } from "react";

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
  const [value, setValue] = useState(entityIndex != null ? getComponentValue(component, entityIndex) : undefined);

  useEffect(() => {
    // component or entityIndex changed, update state to latest value
    setValue(entityIndex != null ? getComponentValue(component, entityIndex) : undefined);
    if (entityIndex == null) return;

    const queryResult = defineQuery([Has(component)], { runOnInit: false });
    const subscription = queryResult.update$.subscribe((update) => {
      if (update.component === component && update.entity === entityIndex) {
        const [nextValue, prevValue] = update.value;
        // TODO: fix types in `defineQuery` so we don't have to cast this
        setValue(nextValue as ComponentValue<S>);
      }
    });
    return () => subscription.unsubscribe();
  }, [component, entityIndex]);

  return value ?? defaultValue;
}
