import { map, pipe } from "rxjs";
import { getComponentValue } from "./Component";
import { UpdateType } from "./constants";
import { Component, ComponentUpdate, ComponentValue, EntityIndex, Indexer, Schema } from "./types";

/**
 * Type guard to infer the TypeScript type of a given component update
 *
 * @param update Component update to infer the type of.
 * @param component {@link defineComponent Component} to check whether the given update corresponds to it.
 * @returns True (+ infered type for `update`) if `update` belongs to `component`. Else false.
 */
export function isComponentUpdate<S extends Schema>(
  update: ComponentUpdate,
  component: Component<S>
): update is ComponentUpdate<S> {
  return update.component === component;
}

/**
 * Helper function to create a component update for the current component value of a given entity.
 *
 * @param entity Entity to create the component update for.
 * @param component Component to create the component update for.
 * @returns Component update corresponding to the given entity, the given component and the entity's current component value.
 */
export function toUpdate<S extends Schema>(entity: EntityIndex, component: Component<S>) {
  const value = getComponentValue(component, entity);
  return {
    entity,
    component,
    value: [value, undefined],
    type: value == null ? UpdateType.Noop : UpdateType.Enter,
  } as ComponentUpdate<S> & {
    type: UpdateType;
  };
}

/**
 * Helper function to turn a stream of {@link EntityIndex EntityIndices} into a stream of component updates of the given component.
 * @param component Component to create update stream for.
 * @returns Unary function to be used with RxJS that turns stream of {@link EntityIndex EntityIndices} into stream of component updates.
 */
export function toUpdateStream<S extends Schema>(component: Component<S>) {
  return pipe(map((entity: EntityIndex) => toUpdate(entity, component)));
}

/**
 * Helper function to check whether a given component is indexed.
 * @param c
 * @returns
 */
export function isIndexer<S extends Schema>(c: Component<S> | Indexer<S>): c is Indexer<S> {
  return "getEntitiesWithValue" in c;
}

/**
 * Helper function to check whether a given component value is partial or full.
 * @param component
 * @param value
 * @returns
 */
export function isFullComponentValue<S extends Schema>(
  component: Component<S>,
  value: Partial<ComponentValue<S>>
): value is ComponentValue<S> {
  return Object.keys(component.schema).every((key) => key in value);
}
