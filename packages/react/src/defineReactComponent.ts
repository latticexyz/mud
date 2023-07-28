import {
  ComponentValue,
  Entity,
  Has,
  Metadata,
  Options,
  Schema,
  World,
  defineComponent,
  defineQuery,
  getComponentValue,
  getEntitySymbol,
  isComponentUpdate,
} from "@latticexyz/recs";
import { useEffect, useState } from "react";

export function defineReactComponent<Overridable extends boolean, S extends Schema, M extends Metadata = Metadata>(
  world: World,
  schema: S,
  options?: Options<Overridable, M>
) {
  const component = defineComponent(world, schema, options);

  function useValue(entity: Entity): ComponentValue<S> | undefined;
  function useValue(entity: Entity, defaultValue?: ComponentValue<S>): ComponentValue<S>;

  function useValue(entity: Entity, defaultValue?: ComponentValue<S>) {
    const entitySymbol = getEntitySymbol(entity);

    const [value, setValue] = useState(entity != null ? getComponentValue(component, entity) : undefined);
    useEffect(() => {
      // component or entity changed, update state to latest value
      setValue(entity != null ? getComponentValue(component, entity) : undefined);
      if (entity == null) return;
      // fix: if pre-populated with state, useComponentValue doesn’t update when there’s a component that has been removed.
      const queryResult = defineQuery([Has(component)], { runOnInit: true });
      const subscription = queryResult.update$.subscribe((update) => {
        if (isComponentUpdate(update, component) && update.entity === entity) {
          const [nextValue] = update.value;
          setValue(nextValue);
        }
      });
      return () => subscription.unsubscribe();
    }, [component, entity]);
    return value ?? defaultValue;
  }
  return {
    ...component,
    use: useValue,
  };
}
