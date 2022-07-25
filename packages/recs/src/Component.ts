import { uuid } from "@latticexyz/utils";
import { mapObject } from "@latticexyz/utils";
import { filter, Subject } from "rxjs";
import { OptionalTypes } from "./constants";
import { createIndexer } from "./Indexer";
import {
  Component,
  ComponentValue,
  EntityIndex,
  Indexer,
  Metadata,
  OverridableComponent,
  Override,
  Schema,
  World,
} from "./types";
import { isFullComponentValue, isIndexer } from "./utils";

export function defineComponent<S extends Schema, M extends Metadata>(
  world: World,
  schema: S,
  options?: { id?: string; metadata?: M; indexed?: boolean }
) {
  if (Object.keys(schema).length === 0) throw new Error("Component schema must have at least one key");
  const id = options?.id ?? uuid();
  const values = mapObject(schema, () => new Map());
  const update$ = new Subject();
  const metadata = options?.metadata;
  const entities = () => (Object.values(values)[0] as Map<EntityIndex, unknown>).keys();
  let component = { values, schema, id, update$, metadata, entities, world } as Component<S, M>;
  if (options?.indexed) component = createIndexer(component);
  world.registerComponent(component);
  return component;
}

export function setComponent<S extends Schema>(component: Component<S>, entity: EntityIndex, value: ComponentValue<S>) {
  const prevValue = getComponentValue(component, entity);
  for (const [key, val] of Object.entries(value)) {
    component.values[key].set(entity, val);
  }
  component.update$.next({ entity, value: [value, prevValue], component });
}

export function updateComponent<T extends Schema>(
  component: Component<T>,
  entity: EntityIndex,
  value: Partial<ComponentValue<T>>
) {
  const currentValue = getComponentValueStrict(component, entity);
  setComponent(component, entity, { ...currentValue, ...value });
}

export function removeComponent(component: Component, entity: EntityIndex) {
  const prevValue = getComponentValue(component, entity);
  for (const key of Object.keys(component.values)) {
    component.values[key].delete(entity);
  }
  component.update$.next({ entity, value: [undefined, prevValue], component });
}

export function hasComponent<T extends Schema>(component: Component<T>, entity: EntityIndex): boolean {
  const map = Object.values(component.values)[0];
  return map.has(entity);
}

export function getComponentValue<S extends Schema>(
  component: Component<S>,
  entity: EntityIndex
): ComponentValue<S> | undefined {
  const value: Record<string, unknown> = {};

  // Get the value of each schema key
  const schemaKeys = Object.keys(component.schema);
  for (const key of schemaKeys) {
    const val = component.values[key].get(entity);
    if (val === undefined && !OptionalTypes.includes(component.schema[key])) return undefined;
    value[key] = val;
  }

  return value as ComponentValue<S>;
}

export function getComponentValueStrict<T extends Schema>(
  component: Component<T>,
  entity: EntityIndex
): ComponentValue<T> {
  const value = getComponentValue(component, entity);
  if (!value) throw new Error("No component value for this entity");
  return value;
}

export function componentValueEquals<T extends Schema>(a?: Partial<ComponentValue<T>>, b?: ComponentValue<T>): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  let equals = true;
  for (const key of Object.keys(a)) {
    equals = a[key] === b[key];
    if (!equals) return false;
  }
  return equals;
}

export function withValue<S extends Schema>(
  component: Component<S>,
  value: ComponentValue<S>
): [Component<S>, ComponentValue<S>] {
  return [component, value];
}

export function getEntitiesWithValue<T extends Schema>(
  component: Component<T> | Indexer<T>,
  value: Partial<ComponentValue<T>>
): Set<EntityIndex> {
  // Shortcut for indexers
  if (isIndexer(component) && isFullComponentValue(component, value)) {
    return component.getEntitiesWithValue(value);
  }

  // Trivial implementation for regular components
  const entities = new Set<EntityIndex>();
  for (const entity of getComponentEntities(component)) {
    const val = getComponentValue(component, entity);
    if (componentValueEquals(value, val)) {
      entities.add(entity);
    }
  }
  return entities;
}

export function getComponentEntities(component: Component): IterableIterator<EntityIndex> {
  return component.entities();
}

/**
 * An overidable component is a mirror of the source component, with functions to lazily override specific entity values.
 * Lazily override means the values are not actually set to the source component, but the override is only returned if the value is read.
 * @param component source component
 * @returns overridable component
 */
export function overridableComponent<S extends Schema>(component: Component<S>): OverridableComponent<S> {
  let nonce = 0;

  // Map from OverrideId to Override (to be able to add multiple overrides to the same Entity)
  const overrides = new Map<string, { update: Override<S>; nonce: number }>();

  // Map from EntityIndex to current overridden component value
  const overriddenEntityValues = new Map<EntityIndex, Partial<ComponentValue<S>>>();

  // Update event stream that takes into account overridden entity values
  const update$ = new Subject<{
    entity: EntityIndex;
    value: [ComponentValue<S> | undefined, ComponentValue<S> | undefined];
    component: Component;
  }>();

  // Channel through update events from the original component if there are no overrides
  component.update$.pipe(filter((e) => !overriddenEntityValues.get(e.entity))).subscribe(update$);

  // Add a new override to some entity
  function addOverride(id: string, update: Override<S>) {
    overrides.set(id, { update, nonce: nonce++ });
    setOverriddenComponentValue(update.entity, update.value);
  }

  // Remove an override from an entity
  function removeOverride(id: string) {
    const affectedEntity = overrides.get(id)?.update.entity;
    overrides.delete(id);

    if (affectedEntity == null) return;

    // If there are more overries affecting this entity,
    // set the overriddenEntityValue to the last override
    const relevantOverrides = [...overrides.values()]
      .filter((o) => o.update.entity === affectedEntity)
      .sort((a, b) => (a.nonce < b.nonce ? -1 : 1));

    if (relevantOverrides.length > 0) {
      const lastOverride = relevantOverrides[relevantOverrides.length - 1];
      setOverriddenComponentValue(affectedEntity, lastOverride.update.value);
    } else {
      setOverriddenComponentValue(affectedEntity, undefined);
    }
  }

  // Internal function to get the current overridden value or value of the source component
  function getOverriddenComponentValue(entity: EntityIndex): ComponentValue<S> | undefined {
    const originalValue = getComponentValue(component, entity);
    const overriddenValue = overriddenEntityValues.get(entity);
    return originalValue || overriddenValue
      ? ({ ...originalValue, ...overriddenValue } as ComponentValue<S>)
      : undefined;
  }

  const valueProxyHandler: (key: keyof S) => ProxyHandler<typeof component.values[typeof key]> = (key: keyof S) => ({
    get(target, prop) {
      // Intercept calls to component.value[key].get(entity)
      if (prop === "get") {
        return (entity: EntityIndex) => {
          const originalValue = target.get(entity);
          const overriddenValue = overriddenEntityValues.get(entity);
          return overriddenValue && overriddenValue[key] != null ? overriddenValue[key] : originalValue;
        };
      }

      // Intercept calls to component.value[key].has(entity)
      if (prop === "has") {
        return (entity: EntityIndex) => {
          return target.has(entity) || overriddenEntityValues.has(entity);
        };
      }

      // Intercept calls to component.value[key].keys()
      if (prop === "keys") {
        return () => new Set([...target.keys(), ...overriddenEntityValues.keys()]).values();
      }
      return Reflect.get(target, prop);
    },
  });

  const partialValues: Partial<Component<S>["values"]> = {};
  for (const key of Object.keys(component.values) as (keyof S)[]) {
    partialValues[key] = new Proxy(component.values[key], valueProxyHandler(key));
  }
  const valuesProxy = partialValues as Component<S>["values"];

  const overriddenComponent = new Proxy(component, {
    get(target, prop) {
      if (prop === "addOverride") return addOverride;
      if (prop === "removeOverride") return removeOverride;
      if (prop === "values") return valuesProxy;
      if (prop === "update$") return update$;

      return Reflect.get(target, prop);
    },
    has(target, prop) {
      if (prop === "addOverride" || prop === "removeOverride") return true;
      return prop in target;
    },
  }) as OverridableComponent<S>;

  // Internal function to set the current overridden component value and emit the update event
  function setOverriddenComponentValue(entity: EntityIndex, value?: Partial<ComponentValue<S>>) {
    const prevValue = getOverriddenComponentValue(entity);
    if (value) overriddenEntityValues.set(entity, value);
    else overriddenEntityValues.delete(entity);
    update$.next({ entity, value: [getOverriddenComponentValue(entity), prevValue], component: overriddenComponent });
  }

  return overriddenComponent;
}
