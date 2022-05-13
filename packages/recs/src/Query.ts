import { computed, IReactionDisposer, observable, reaction, runInAction, toJS } from "mobx";
import { componentValueEquals, getComponentValue, getEntitiesWithValue, hasComponent } from "./Component";
import {
  Component,
  ComponentValue,
  Entity,
  EntityQueryFragment,
  HasQueryFragment,
  HasValueQueryFragment,
  NotQueryFragment,
  NotValueQueryFragment,
  ProxyExpandQueryFragment,
  ProxyReadQueryFragment,
  Query,
  QueryFragment,
  QueryFragments,
  QueryFragmentType,
  Schema,
  SettingQueryFragment,
  World,
} from "./types";
import { Type } from "./constants";

export function Has<T extends Schema>(component: Component<T>): HasQueryFragment<T> {
  return { type: QueryFragmentType.Has, component };
}

export function Not<T extends Schema>(component: Component<T>): NotQueryFragment<T> {
  return { type: QueryFragmentType.Not, component };
}

export function HasValue<T extends Schema>(
  component: Component<T>,
  value: Partial<ComponentValue<T>>
): HasValueQueryFragment<T> {
  return { type: QueryFragmentType.HasValue, component, value };
}

export function NotValue<T extends Schema>(
  component: Component<T>,
  value: Partial<ComponentValue<T>>
): NotValueQueryFragment<T> {
  return { type: QueryFragmentType.NotValue, component, value };
}

export function ProxyRead(component: Component<{ entity: Type.Entity }>, depth: number): ProxyReadQueryFragment {
  return { type: QueryFragmentType.ProxyRead, component, depth };
}

export function ProxyExpand(component: Component<{ entity: Type.Entity }>, depth: number): ProxyExpandQueryFragment {
  return { type: QueryFragmentType.ProxyExpand, component, depth };
}

function passesQueryFragment<T extends Schema>(entity: Entity, fragment: EntityQueryFragment<T>): boolean {
  if (fragment.type === QueryFragmentType.Has) {
    // Entity must have the given component
    return hasComponent(fragment.component, entity);
  }

  if (fragment.type === QueryFragmentType.HasValue) {
    // Entity must have the given component value
    return componentValueEquals(fragment.value, getComponentValue(fragment.component, entity));
  }

  if (fragment.type === QueryFragmentType.Not) {
    // Entity must not have the given component
    return !hasComponent(fragment.component, entity);
  }

  if (fragment.type === QueryFragmentType.NotValue) {
    // Entity must not have the given component value
    return !componentValueEquals(fragment.value, getComponentValue(fragment.component, entity));
  }

  throw new Error("Unknown query fragment");
}

function passesQueryFragmentProxy<T extends Schema>(
  entity: Entity,
  fragment: EntityQueryFragment<T>,
  proxyRead: ProxyReadQueryFragment
): boolean | null {
  let proxyEntity: Entity = entity;
  let passes = false;
  for (let i = 0; i < proxyRead.depth; i++) {
    const value = getComponentValue(proxyRead.component, proxyEntity);
    // If the current entity does not have the proxy component, abort
    if (!value) return null;

    // Move up the proxy chain
    proxyEntity = value.entity;
    passes = passesQueryFragment(proxyEntity, fragment);

    if (isBreakingPassState(passes, fragment)) {
      return passes;
    }
  }
  return passes;
}

function isPositiveFragment<T extends Schema>(
  fragment: QueryFragment<T>
): fragment is HasQueryFragment<T> | HasValueQueryFragment<T> {
  return fragment.type === QueryFragmentType.Has || fragment.type == QueryFragmentType.HasValue;
}

function isNegativeFragment<T extends Schema>(
  fragment: QueryFragment<T>
): fragment is NotQueryFragment<T> | NotValueQueryFragment<T> {
  return fragment.type === QueryFragmentType.Not || fragment.type == QueryFragmentType.NotValue;
}

function isSettingFragment<T extends Schema>(fragment: QueryFragment<T>): fragment is SettingQueryFragment {
  return fragment.type === QueryFragmentType.ProxyExpand || fragment.type == QueryFragmentType.ProxyRead;
}

// For positive fragments (Has/HasValue) we need to find any passing entity up the proxy chain
// so as soon as passes is true, we can early return. For negative fragments (Not/NotValue) every entity
// up the proxy chain must pass, so we can early return if we find one that doesn't pass.
function isBreakingPassState(passes: boolean, fragment: EntityQueryFragment<Schema>) {
  return (passes && isPositiveFragment(fragment)) || (!passes && isNegativeFragment(fragment));
}

/**
 * Recursively computes all direct and indirect child entities up to the specified depth
 * @param entity Entity to get all child entities up to the specified depth
 * @param component Entity reference component
 * @param depth Depth up to which the recursion should be applied
 * @returns Set of entities that are child entities of the given entity via the given component
 */
export function getChildEntities(
  entity: Entity,
  component: Component<{ entity: Type.Entity }>,
  depth: number
): Set<Entity> {
  if (depth === 0) return new Set();

  const directChildEntities = getEntitiesWithValue(component, { entity });
  if (depth === 1) return directChildEntities;

  const indirectChildEntities = [...directChildEntities]
    .map((childEntity) => [...getChildEntities(childEntity, component, depth - 1)])
    .flat();

  return new Set([...directChildEntities, ...indirectChildEntities]);
}

export function defineQuery(fragments: QueryFragments, initialSet?: Set<Entity>): Query {
  return computed(() => {
    let entities: Set<Entity> | undefined = initialSet;
    let proxyRead: ProxyReadQueryFragment | undefined = undefined;
    let proxyExpand: ProxyExpandQueryFragment | undefined = undefined;

    // Process fragments
    for (const fragment of fragments) {
      if (isSettingFragment(fragment)) {
        // Store setting fragments for subsequent query fragments
        if (fragment.type === QueryFragmentType.ProxyRead) proxyRead = fragment;
        if (fragment.type === QueryFragmentType.ProxyExpand) proxyExpand = fragment;
      } else if (!entities) {
        // Handle entity query fragments
        // First regular fragment must be Has or HasValue
        if (isNegativeFragment(fragment)) {
          throw new Error("First EntityQueryFragment must be Has or HasValue");
        }

        // Create the first interim result
        entities =
          fragment.type === QueryFragmentType.Has
            ? toJS(fragment.component.entities)
            : getEntitiesWithValue(fragment.component, fragment.value);

        // Add entity's children up to the specified depth if proxy expand is active
        if (proxyExpand && proxyExpand.depth > 0) {
          for (const entity of [...entities]) {
            for (const childEntity of getChildEntities(entity, proxyExpand.component, proxyExpand.depth)) {
              entities.add(childEntity);
            }
          }
        }
      } else {
        // There already is an interim result, apply the current fragment
        for (const entity of [...entities]) {
          // Branch 1: Simple / check if the current entity passes the query fragment
          let passes: boolean = passesQueryFragment(entity, fragment);

          // Branch 2: Proxy upwards / check if proxy entity passes the query
          if (proxyRead && proxyRead.depth > 0 && !isBreakingPassState(passes, fragment)) {
            passes = passesQueryFragmentProxy(entity, fragment, proxyRead) ?? passes;
          }

          // If the entity didn't pass the query fragment, remove it from the interim set
          if (!passes) entities.delete(entity);

          // Branch 3: Proxy downwards / run the query fragments on child entities if proxy expand is active
          if (proxyExpand && proxyExpand.depth > 0) {
            const childEntities = getChildEntities(entity, proxyExpand.component, proxyExpand.depth);
            for (const childEntity of childEntities) {
              // Add the child entity if it passes the direct check
              // or if a proxy read is active and it passes the proxy read check
              if (
                passesQueryFragment(childEntity, fragment) ||
                (proxyRead && proxyRead.depth > 0 && passesQueryFragmentProxy(childEntity, fragment, proxyRead))
              )
                entities.add(childEntity);
            }
          }
        }
      }
    }

    return entities ?? new Set<Entity>();
  });
}

export function getQueryResult(fragments: QueryFragments): Set<Entity> {
  return defineQuery(fragments).get();
}

function defineChangeQuery(
  world: World,
  fragments: QueryFragments,
  filter: (oldValue: Set<Entity>, newValue: Set<Entity>) => Set<Entity>,
  options?: { runOnInit?: boolean }
): Query {
  const query = defineQuery(fragments);
  const diff = observable.box(new Set<Entity>());
  world.registerDisposer(() => runInAction(() => diff.set(new Set<Entity>())));

  const disposer = reaction(
    () => query.get(),
    (newValue, oldValue) => {
      runInAction(() => {
        diff.set(filter(oldValue || new Set(), newValue));
      });
    },
    { fireImmediately: options?.runOnInit }
  );
  world.registerDisposer(disposer);

  return computed(() => toJS(diff.get()));
}

/**
 * Return the entities that haven't been there before
 */
export function defineEnterQuery(world: World, fragments: QueryFragments, options?: { runOnInit?: boolean }): Query {
  return defineChangeQuery(
    world,
    fragments,
    (oldValue, newValue) => new Set([...newValue].filter((x) => !oldValue.has(x))),
    options
  );
}

/**
 * Return the entities that have been there before but not anymore
 */
export function defineExitQuery(world: World, fragments: QueryFragments, options?: { runOnInit?: boolean }): Query {
  return defineChangeQuery(
    world,
    fragments,
    (oldValue, newValue) => new Set([...oldValue].filter((x) => !newValue.has(x))),
    options
  );
}

/**
 * Return the entities whose components (in the query) have been updated
 */
export function defineUpdateQuery(world: World, fragments: QueryFragments, options?: { runOnInit?: boolean }): Query {
  const updatedEntities = observable(new Set<Entity>());
  world.registerDisposer(() => runInAction(() => updatedEntities.clear()));

  const observedEntities = new Map<Entity, IReactionDisposer>();
  world.registerDisposer(() => {
    for (const dispose of observedEntities.values()) dispose();
    runInAction(() => {
      observedEntities.clear();
    });
  });

  // All components in the query whose entity values should be observed
  const components = fragments
    // .filter((fragment) => fragment.type === QueryFragmentType.Has) // We need to observe all components, not just has
    .map((fragment) => fragment.component);

  function observeEntity(entity: Entity, options?: { runOnInit?: boolean; keepPrev?: boolean }) {
    // Stop previous observer if already observing this entity
    let stopObserving = observedEntities.get(entity);
    if (stopObserving) stopObserving();

    for (const component of components) {
      const computedValue = computed(() => getComponentValue(component, entity), { equals: componentValueEquals });
      const data = () => computedValue.get();
      const effect = (keepPrev?: boolean) => {
        // This entity's value changed.
        // If keepPref is false, we first reset the set and then add the updated entity
        // so that observers also get triggered if the same entity changes twice in a row.
        !keepPrev && runInAction(() => updatedEntities.clear());
        runInAction(() => updatedEntities.add(entity));
      };

      // Returns the entity once when observation starts if runOnInit is true
      if (options?.runOnInit) effect(options?.keepPrev);

      // Start observing the entitiy and store the reaction disposer
      stopObserving = reaction(data, () => effect());
      observedEntities.set(entity, stopObserving);
    }
  }

  // Start observing all entities that match the query at the time it is defined
  const query = defineQuery(fragments);
  const entities = query.get();
  runInAction(() => {
    for (const entity of entities) {
      observeEntity(entity, { runOnInit: options?.runOnInit, keepPrev: options?.runOnInit });
    }
  });

  // Start observing new entities matching the query
  const enterQuery = defineEnterQuery(world, fragments);
  const enterDisposer = reaction(
    () => enterQuery.get(),
    (newEntities) => {
      for (const entity of newEntities) {
        observeEntity(entity, { runOnInit: true });
      }
    }
  );
  world.registerDisposer(enterDisposer);

  // Stop observing entites that don't match the query anymore
  const exitQuery = defineExitQuery(world, fragments);
  const exitDisposer = reaction(
    () => exitQuery.get(),
    (removedEntities) => {
      for (const entity of removedEntities) {
        const stopObserving = observedEntities.get(entity);
        if (stopObserving) stopObserving();
        observedEntities.delete(entity);
      }
    }
  );
  world.registerDisposer(exitDisposer);

  return computed(() => toJS(updatedEntities));
}
