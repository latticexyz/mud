import {
  Component,
  ComponentUpdate,
  ComponentValue,
  defineQuery,
  Entity,
  getComponentValue,
  Has,
  Schema,
  UpdateType,
} from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { debounceTime, filter } from "rxjs";

export function useComponentValue<S extends Schema>(
  component: Component<S>,
  entity: Entity | undefined,
  defaultValue: ComponentValue<S>
): ComponentValue<S>;

export function useComponentValue<S extends Schema>(
  component: Component<S>,
  entity: Entity | undefined
): ComponentValue<S> | undefined;

export function useComponentValue<S extends Schema>(
  component: Component<S>,
  entity: Entity | undefined,
  defaultValue?: ComponentValue<S>
) {
  const [value, setValue] = useState(entity != null ? getComponentValue(component, entity) : undefined);

  useEffect(() => {
    // component or entity changed, update state to latest value
    setValue(entity != null ? getComponentValue(component, entity) : undefined);
    if (entity == null) return;

    const queryResult = defineQuery([Has(component)], { runOnInit: false });
    const subscription = queryResult.update$
      .pipe(
        filter(
          (update): update is ComponentUpdate<S> & { type: UpdateType } =>
            update.component === component && update.entity === entity
        ),
        debounceTime(10)
      )
      .subscribe((update) => {
        const [nextValue] = update.value;
        setValue(nextValue);
      });
    return () => subscription.unsubscribe();
  }, [component, entity]);

  return value ?? defaultValue;
}
