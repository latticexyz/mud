import { concat, EMPTY, from, Observable } from "rxjs";
import { getComponentEntities, removeComponent, setComponent } from "./Component";
import { UpdateType } from "./constants";
import { defineEnterQuery, defineExitQuery, defineQuery, defineUpdateQuery } from "./Query";
import { Component, ComponentUpdate, ComponentValue, EntityIndex, QueryFragment, Schema, World } from "./types";
import { toUpdateStream } from "./utils";

/**
 * Create a system that is called on every update of the given observable.
 *
 * @remarks
 * Advantage of using this function over directly subscribing to the RxJS observable is that the system is registered in the `world` and
 * disposed when the `world` is disposed (eg. during a hot reload in development).
 *
 * @param world {@link World} object this system should be registered in.
 * @param observable$ Observable to react to.
 * @param system System function to run on updates of the `observable$`. System function gets passed the update events from the `observable$`.
 */
export function defineRxSystem<T>(world: World, observable$: Observable<T>, system: (event: T) => void) {
  const subscription = observable$.subscribe(system);
  world.registerDisposer(() => subscription?.unsubscribe());
}

/**
 * Create a system that is called on every event of the given {@link defineUpdateQuery update query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Update query to react to.
 * @param system System function to run when the result of the given update query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineUpdateSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineUpdateQuery(query, options), system);
}

/**
 * Create a system that is called on every event of the given {@link defineEnterQuery enter query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Enter query to react to.
 * @param system System function to run when the result of the given enter query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineEnterSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineEnterQuery(query, options), system);
}

/**
 * Create a system that is called on every event of the given {@link defineExitQuery exit query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Exit query to react to.
 * @param system System function to run when the result of the given exit query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineExitSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineExitQuery(query, options), system);
}

/**
 * Create a system that is called on every event of the given {@link defineQuery query}.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Query to react to.
 * @param system System function to run when the result of the given query changes.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities matching the query when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
export function defineSystem(
  world: World,
  query: QueryFragment[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
  options: { runOnInit?: boolean } = { runOnInit: true }
) {
  defineRxSystem(world, defineQuery(query, options).update$, system);
}

/**
 * Create a system that is called every time the given component is updated.
 *
 * @param world {@link World} object this system should be registered in.
 * @param component Component to whose updates to react.
 * @param system System function to run when the given component is updated.
 * @param options Optional: {
 * runOnInit: if true, run this system for all entities in the component when the system is created.
 * Else only run on updates after the system is created. Default true.
 * }
 */
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
 * Create a system to synchronize updates to one component with another component.
 *
 * @param world {@link World} object this system should be registered in.
 * @param query Result of `component` is added to all entites matching this query.
 * @param component Function returning the component to be added to all entities matching the given query.
 * @param value Function returning the component value to be added to all entities matching the given query.
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
