import { transformIterator } from "@latticexyz/utils";
import { Subject, filter, map } from "rxjs";
import { getComponentValue } from "./Component";
import { getEntityString, getEntitySymbol } from "./Entity";
import {
  Component,
  ComponentValue,
  Entity,
  EntitySymbol,
  Metadata,
  OverridableComponent,
  Override,
  Schema,
} from "./types";

export function createOverridableComponent<S extends Schema, M extends Metadata, T = unknown>(
  component: Component<S, M, T>
) {
  let nonce = 0;

  // Map from OverrideId to Override (to be able to add multiple overrides to the same Entity)
  const overrides = new Map<string, { update: Override<S, T>; nonce: number }>();

  // Map from EntitySymbol to current overridden component value
  const overriddenEntityValues = new Map<EntitySymbol, Partial<ComponentValue<S, T>> | null>();

  // Update event stream that takes into account overridden entity values
  const update$ = new Subject<{
    entity: Entity;
    value: [ComponentValue<S, T> | undefined, ComponentValue<S, T> | undefined];
    component: Component<S, Metadata, T>;
  }>();

  // Add a new override to some entity
  function addOverride(id: string, update: Override<S, T>) {
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
  function getOverriddenComponentValue(entity: Entity): ComponentValue<S, T> | undefined {
    const originalValue = getComponentValue(component, entity);
    const entitySymbol = getEntitySymbol(entity);
    const overriddenValue = overriddenEntityValues.get(entitySymbol);
    return (originalValue || overriddenValue) && overriddenValue !== null // null is a valid override, in this case return undefined
      ? ({ ...originalValue, ...overriddenValue } as ComponentValue<S, T>)
      : undefined;
  }

  for (const key of Object.keys(component.values) as (keyof S)[]) {
    const originalGet = component.values[key].get;
    const originalHas = component.values[key].has;
    const originalKeys = component.values[key].keys;

    component.values[key].get = (entity: EntitySymbol) => {
      const overriddenValue = overriddenEntityValues.get(entity);
      const originalValue = originalGet.call(component.values[key], entity);
      return overriddenValue && overriddenValue[key] != null ? overriddenValue[key] : originalValue;
    };

    component.values[key].has = (entity: EntitySymbol) => {
      return originalHas.call(component.values[key], entity) || overriddenEntityValues.has(entity);
    };

    component.values[key].keys = () => {
      return new Set([...originalKeys.call(component.values[key]), ...overriddenEntityValues.keys()]).values();
    };
  }
  const overriddenComponent = {
    ...component,
    addOverride,
    removeOverride,
    update$,
    entities: () =>
      new Set([...transformIterator(overriddenEntityValues.keys(), getEntityString), ...component.entities()]).values(),
  };
  // Internal function to set the current overridden component value and emit the update event
  function setOverriddenComponentValue(entity: Entity, value?: Partial<ComponentValue<S, T>> | null) {
    const entitySymbol = getEntitySymbol(entity);
    // Check specifically for undefined - null is a valid override
    const prevValue = getOverriddenComponentValue(entity);
    if (value !== undefined) overriddenEntityValues.set(entitySymbol, value);
    else overriddenEntityValues.delete(entitySymbol);
    update$.next({ entity, value: [getOverriddenComponentValue(entity), prevValue], component: overriddenComponent });
  }

  // Channel through update events from the original component if there are no overrides
  component.update$
    .pipe(
      filter((e) => !overriddenEntityValues.get(getEntitySymbol(e.entity))),
      map((update) => ({ ...update, component: overriddenComponent }))
    )
    .subscribe(update$);

  return overriddenComponent;
}
