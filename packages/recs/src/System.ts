import { autorun, reaction } from "mobx";
import { Subscription } from "rxjs";
import { removeComponent, setComponent } from "./Component";
import { defineExitQuery, defineEnterQuery } from "./Query";
import { Component, ComponentValue, ComponentWithStream, Entity, QueryFragments, Schema, World } from "./types";

export type System = () => void;

export function defineSystem(world: World, system: (world: World) => void): System {
  return () => system(world);
}

/**
 * @param world ECS world this component is defined in
 * @param system Function to be called whenever any of the observable data accessed in the function changes
 * @returns Function to dispose the system
 */
export function defineAutorunSystem(world: World, system: () => void) {
  const disposer = autorun(() => system());
  world.registerDisposer(disposer);
}

/**
 * @param world ECS world this component is defined in
 * @param observe System is rerun if any of the data accessed in this function changes. Result of this function is passed to the system.
 * @param system Function to be run when any of the data accessed in the observe function changes
 * @returns Function to dispose the system
 */
export function defineReactionSystem<T>(world: World, observe: () => T, system: (data: T) => void) {
  const disposer = reaction(observe, (data) => system(data), { fireImmediately: true });
  world.registerDisposer(disposer);
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
  query: QueryFragments,
  component: (entity: Entity) => Component<T>,
  value: (entity: Entity) => ComponentValue<T>
) {
  const newEntities = defineEnterQuery(world, query, { runOnInit: true });
  const removedEntities = defineExitQuery(world, query);

  defineReactionSystem(
    world,
    () => newEntities.get(),
    (entities) => {
      for (const entity of entities) {
        setComponent(component(entity), entity, value(entity));
      }
    }
  );

  defineReactionSystem(
    world,
    () => removedEntities.get(),
    (entities) => {
      for (const entity of entities) {
        removeComponent(component(entity), entity);
      }
    }
  );
}

/**
 * Wrapper around component.stream$ that handles registering the dispose function on the world
 * @param world ECS world this component is defined in
 * @param component Component to whose stream to subscribe
 * @param system Function to handle the stream with
 */
export function defineRxSystem<T extends Schema>(
  world: World,
  component: Component<T>,
  system: (stream$: ComponentWithStream<T>["stream$"]) => Subscription
) {
  const subscription = system(component.stream$);
  world.registerDisposer(() => subscription?.unsubscribe());
}
