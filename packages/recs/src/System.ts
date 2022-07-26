import { concat, EMPTY, from, Observable } from "rxjs";
import { getComponentEntities, removeComponent, setComponent } from "./Component";
import { UpdateType } from "./constants";
import { defineEnterQuery, defineExitQuery, defineQuery, defineUpdateQuery } from "./Query";
import { Component, ComponentUpdate, ComponentValue, EntityIndex, QueryFragment, Schema, World } from "./types";
import { toUpdateStream } from "./utils";

export function defineRxSystem<T>(world: World, observable$: Observable<T>, system: (event: T) => void) {
  const subscription = observable$.subscribe(system);
  world.registerDisposer(() => subscription?.unsubscribe());
}

export function defineUpdateSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineUpdateQuery(query, options), system);
}

export function defineEnterSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineEnterQuery(query, options), system);
}

export function defineExitSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineExitQuery(query, options), system);
}

export function defineSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineQuery(query, options).update$, system);
}

export function defineComponentSystem<S extends Schema>(
  world: World,
  component: Component<S>,
  system: (update: ComponentUpdate<S>) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  const initial$ = options?.runOnInit ? from(getComponentEntities(component)).pipe(toUpdateStream(component)) : EMPTY;
  defineRxSystem(world, concat(initial$, component.update$), system);
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
  query: QueryFragment[],
  component: (entity: EntityIndex) => Component<T>,
  value: (entity: EntityIndex) => ComponentValue<T>,
  options: { update?: boolean; runOnInit?: boolean } = { update: false, runOnInit: true }
) {
  defineSystem(
    world,
    query,
    ({ entity, type }) => {
      if (type === UpdateType.Enter) setComponent(component(entity), entity, value(entity));
      if (type === UpdateType.Exit) removeComponent(component(entity), entity);
      if (options?.update && type === UpdateType.Update) setComponent(component(entity), entity, value(entity));
    },
    options
  );
}
