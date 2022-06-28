import { Observable } from "rxjs";
import { removeComponent, setComponent } from "./Component";
import { UpdateType } from "./constants";
import { defineEnterQuery, defineExitQuery, defineQuery, defineUpdateQuery } from "./Query";
import { Component, ComponentUpdate, ComponentValue, Entity, EntityQueryFragment, Schema, World } from "./types";

export function defineRxSystem<T>(world: World, observable$: Observable<T>, system: (event: T) => void) {
  const subscription = observable$.subscribe(system);
  world.registerDisposer(() => subscription?.unsubscribe());
}

export function defineUpdateSystem(
  world: World,
  query: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  defineRxSystem(world, defineUpdateQuery(query), system);
}

export function defineEnterSystem(
  world: World,
  query: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  defineRxSystem(world, defineEnterQuery(query), system);
}

export function defineExitSystem(
  world: World,
  query: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  defineRxSystem(world, defineExitQuery(query), system);
}

export function defineSystem(
  world: World,
  query: EntityQueryFragment[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void
) {
  defineRxSystem(world, defineQuery(query).update$, system);
}

export function defineComponentSystem<S extends Schema>(
  world: World,
  component: Component<S>,
  system: (update: ComponentUpdate<S>) => void
) {
  defineRxSystem(world, component.update$, system);
}

/**
 * @param world ECS world this component is defined in
 * @param query Component is added to all entites returned by the query
 * @param component Component to be added
 * @param value Component value to be added
 * @returns Function to dispose the system
 */
export function defineSyncSystem<T extends Schema>(
  world: World,
  query: EntityQueryFragment[],
  component: (entity: Entity) => Component<T>,
  value: (entity: Entity) => ComponentValue<T>
) {
  defineSystem(world, query, ({ entity, type }) => {
    if (type === UpdateType.Enter) setComponent(component(entity), entity, value(entity));
    if (type === UpdateType.Exit) removeComponent(component(entity), entity);
  });
}
