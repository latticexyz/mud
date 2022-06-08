import { uuid } from "@latticexyz/utils";
import { runInAction, keys, toJS, isObservable, observable, action } from "mobx";
import { Subject } from "rxjs";
import {
  AnyComponent,
  AnyComponentValue,
  Component,
  ComponentValue,
  ComponentWithStream,
  ComponentWithValue,
  Entity,
  OverridableComponent,
  Override,
  Schema,
  ValueType,
  World,
} from "./types";

export function defineComponent<T extends Schema, S = Record<string, unknown>>(
  world: World,
  schema: T,
  options?: { name?: string; metadata: S }
): Component<T> {
  const component: AnyComponent = {
    id: options?.name || uuid(),
    values: {},
    entities: new Set<Entity>(),
    stream$: new Subject(),
    schema,
    metadata: options?.metadata ?? {},
  };

  for (const [key, val] of Object.entries(schema)) {
    component.values[key] = new Map<Entity, ValueType[typeof val]>();
  }

  return world.registerComponent(component) as Component<T>;
}

export function setComponent<T extends Schema>(component: Component<T>, entity: Entity, value: ComponentValue<T>) {
  runInAction(() => {
    for (const [key, val] of Object.entries(value)) {
      component.values[key]?.set(entity, val);
    }

    component.entities.add(entity);
  });
  (component as ComponentWithStream<T>).stream$.next({ entity, value });
}

export function updateComponent<T extends Schema>(
  component: Component<T>,
  entity: Entity,
  value: Partial<ComponentValue<T>>
) {
  const currentValue = getComponentValueStrict(component, entity);
  setComponent(component, entity, { ...currentValue, ...value });
}

export function removeComponent<T extends Schema>(component: Component<T>, entity: Entity) {
  runInAction(() => {
    for (const key of Object.keys(component.values)) {
      component.values[key].delete(entity);
    }

    component.entities.delete(entity);
  });
  (component as ComponentWithStream<T>).stream$.next({ entity, value: undefined });
}

export function hasComponent<T extends Schema>(component: Component<T>, entity: Entity): boolean {
  return component.entities.has(entity);
}

export function getComponentValue<T extends Schema>(
  component: Component<T>,
  entity: Entity
): ComponentValue<T> | undefined {
  const value: AnyComponentValue = {};

  // Get the value of each schema key
  const schemaKeys = isObservable(component.values) ? keys(component.values) : Object.keys(component.values);
  for (const key of schemaKeys) {
    const val = component.values[key as string].get(entity);
    if (val === undefined) return undefined;
    value[key as string] = val;
  }

  // If the schema has no keys, return undefined instead of {}
  if (schemaKeys.length === 0 && !component.entities.has(entity)) return undefined;

  return value as ComponentValue<T>;
}

export function getComponentValueStrict<T extends Schema>(component: Component<T>, entity: Entity): ComponentValue<T> {
  const value = getComponentValue(component, entity);
  if (!value) {
    console.warn("No component value for this entity", toJS(component), entity);
    throw new Error("No component value for this entity");
  }
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

export function withValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): ComponentWithValue<T> {
  return { component, value };
}

export function getEntitiesWithValue<T extends Schema>(
  component: Component<T>,
  value: Partial<ComponentValue<T>>
): Set<Entity> {
  // Trivial implementation, needs to be more efficient
  const entities = new Set<Entity>();
  for (const entity of component.entities) {
    const val = getComponentValue(component, entity);
    if (componentValueEquals(value, val)) {
      entities.add(entity);
    }
  }
  return entities;
}

/**
 * Returns a copy of the component at the current state.
 * Note: the cloned component will be disconnected from the original world and won't be updated if the original component changes.
 * @param component
 * @returns
 */
export function cloneComponent<T extends Schema>(component: Component<T>): Component<T> {
  const clonedComponent: AnyComponent = {
    id: `${component.id}-copy`,
    values: {},
    entities: new Set<Entity>(...component.entities),
    stream$: new Subject(),
    schema: {},
    metadata: {},
  };

  for (const key of Object.keys(component.values)) {
    const value = component.values[key];
    const entries = [...value.entries()];
    clonedComponent.values[key] = new Map(entries) as typeof value;
  }

  return clonedComponent as Component<T>;
}

/**
 * An overidable component is a mirror of the source component, with functions to lazily override specific entity values.
 * Lazily override means the values are not actually set to the source component, but the override is only returned if the value is read.
 * @param component source component
 * @returns overridable component
 */
export function overridableComponent<T extends Schema>(component: Component<T>): OverridableComponent<T> {
  let nonce = 0;
  const overrides = new Map<string, { update: Override<T>; nonce: number }>();

  // Store overridden entity values in an observable map,
  // so that observers of this components get triggered when a
  // specific component values changes.
  const overriddenEntityValues = observable(new Map<Entity, ComponentValue<T>>());

  const addOverride = action((id: string, update: Override<T>) => {
    overrides.set(id, { update, nonce: nonce++ });
    overriddenEntityValues.set(update.entity, update.value);
  });

  const removeOverride = action((id: string) => {
    const affectedEntity = overrides.get(id)?.update.entity;
    overrides.delete(id);

    if (!affectedEntity) return;

    // If there are more overries affecting this entity,
    // set the overriddenEntityValue to the last override
    const relevantOverrides = [...overrides.values()]
      .filter((o) => o.update.entity === affectedEntity)
      .sort((a, b) => (a.nonce < b.nonce ? -1 : 1));

    if (relevantOverrides.length > 0) {
      const lastOverride = relevantOverrides[relevantOverrides.length - 1];
      overriddenEntityValues.set(affectedEntity, lastOverride.update.value);
    } else {
      overriddenEntityValues.delete(affectedEntity);
    }
  });

  const valueProxyHandler: (key: keyof T) => ProxyHandler<typeof component.values[typeof key]> = (key: keyof T) => ({
    get(target, prop) {
      // Intercept calls to component.value[key].get(entity)
      if (prop === "get") {
        return (entity: Entity) => {
          const originalValue = target.get(entity);
          const overriddenValue = overriddenEntityValues.get(entity);
          return overriddenValue ? overriddenValue[key] : originalValue;
        };
      }
      return Reflect.get(target, prop);
    },
  });

  const partialValues: Partial<Component<T>["values"]> = {};
  for (const key of keys(component.values) as (keyof T)[]) {
    partialValues[key] = new Proxy(component.values[key], valueProxyHandler(key));
  }
  const valuesProxy = partialValues as Component<T>["values"];

  return new Proxy(component, {
    get(target, prop) {
      if (prop === "addOverride") return addOverride;
      if (prop === "removeOverride") return removeOverride;
      if (prop === "values") return valuesProxy;

      return Reflect.get(target, prop);
    },
    has(target, prop) {
      if (prop === "addOverride" || prop === "removeOverride") return true;
      return prop in target;
    },
  }) as OverridableComponent<T>;
}
