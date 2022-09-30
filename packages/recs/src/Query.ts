import { filterNullish } from "@latticexyz/utils";
import { observable, ObservableSet } from "mobx";
import { concat, concatMap, filter, from, map, merge, Observable, Observer, of, Subject } from "rxjs";
import {
  componentValueEquals,
  getComponentEntities,
  getComponentValue,
  getEntitiesWithValue,
  hasComponent,
} from "./Component";
import { UpdateType, Type } from "./constants";
import {
  Component,
  ComponentUpdate,
  ComponentValue,
  EntityIndex,
  EntityQueryFragment,
  HasQueryFragment,
  HasValueQueryFragment,
  NotQueryFragment,
  NotValueQueryFragment,
  ProxyExpandQueryFragment,
  ProxyReadQueryFragment,
  QueryFragment,
  QueryFragmentType,
  Schema,
  SettingQueryFragment,
} from "./types";
import { toUpdateStream } from "./utils";

/**
 * Create a {@link HasQueryFragment}.
 *
 * @remarks
 * The {@link HasQueryFragment} filters for entities that have the given component,
 * independent from the component value.
 *
 * @example
 * Query for all entities with a `Position`.
 * ```
 * runQuery([Has(Position)]);
 * ```
 *
 * @param component Component this query fragment refers to.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function Has<T extends Schema>(component: Component<T>): HasQueryFragment<T> {
  return { type: QueryFragmentType.Has, component };
}

/**
 * Create a {@link NotQueryFragment}.
 *
 * @remarks
 * The {@link NotQueryFragment} filters for entities that don't have the given component,
 * independent from the component value.
 *
 * @example
 * Query for all entities with a `Position` that are not `Movable`.
 * ```
 * runQuery([Has(Position), Not(Movable)]);
 * ```
 *
 * @param component Component this query fragment refers to.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function Not<T extends Schema>(component: Component<T>): NotQueryFragment<T> {
  return { type: QueryFragmentType.Not, component };
}

/**
 * Create a {@link HasValueQueryFragment}.
 *
 * @remarks
 * The {@link HasValueQueryFragment} filters for entities that have the given component
 * with the given component value.
 *
 * @example
 * Query for all entities at Position (0,0).
 * ```
 * runQuery([HasValue(Position, { x: 0, y: 0 })]);
 * ```
 *
 * @param component Component this query fragment refers to.
 * @param value Only include entities with this (partial) component value from the result.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function HasValue<T extends Schema>(
  component: Component<T>,
  value: Partial<ComponentValue<T>>
): HasValueQueryFragment<T> {
  return { type: QueryFragmentType.HasValue, component, value };
}

/**
 * Create a {@link NotValueQueryFragment}.
 *
 * @remarks
 * The {@link NotValueQueryFragment} filters for entities that don't have the given component
 * with the given component value.
 *
 * @example
 * Query for all entities that have a `Position`, except for those at `Position` (0,0).
 * ```
 * runQuery([Has(Position), NotValue(Position, { x: 0, y: 0 })]);
 * ```
 *
 * @param component Component this query fragment refers to.
 * @param value Exclude entities with this (partial) component value from the result.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function NotValue<T extends Schema>(
  component: Component<T>,
  value: Partial<ComponentValue<T>>
): NotValueQueryFragment<T> {
  return { type: QueryFragmentType.NotValue, component, value };
}

/**
 * Create a {@link ProxyReadQueryFragment}.
 *
 * @remarks
 * The {@link ProxyReadQueryFragment} activates the "proxy read mode" for the rest of the query.
 * This means that for all remaining fragments in the query not only the entities themselves are checked, but also
 * their "ancestors" up to the given `depth` on the relationship chain defined by the given `component`.
 *
 * @example
 * Query for all entities that have a `Position` and are (directly or indirectly) owned by an entity with `Name` "Alice".
 * ```
 * runQuery([Has(Position), ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })]);
 * ```
 *
 * @param component Component this query fragment refers to.
 * @param depth Max depth in the relationship chain to traverse.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function ProxyRead(component: Component<{ value: Type.Entity }>, depth: number): ProxyReadQueryFragment {
  return { type: QueryFragmentType.ProxyRead, component, depth };
}

/**
 * Create a {@link ProxyExpandQueryFragment}.
 *
 * @remarks
 * The {@link ProxyExpandQueryFragment} activates the "proxy expand mode" for the rest of the query.
 * This means that for all remaining fragments in the query not only the matching entities themselves are included in the intermediate set,
 * but also all their "children" down to the given `depth` on the relationship chain defined by the given `component`.
 *
 * @example
 * Query for all entities (directly or indirectly) owned by an entity with `Name` "Alice".
 * ```
 * runQuery([ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })]);
 * ```
 *
 * @param component Component to apply this query fragment to.
 * @param depth Max depth in the relationship chain to traverse.
 * @returns query fragment to be used in {@link runQuery} or {@link defineQuery}.
 */
export function ProxyExpand(component: Component<{ value: Type.Entity }>, depth: number): ProxyExpandQueryFragment {
  return { type: QueryFragmentType.ProxyExpand, component, depth };
}

/**
 * Helper function to check whether a given entity passes a given query fragment.
 *
 * @param entity Entity to check.
 * @param fragment Query fragment to check.
 * @returns True if the entity passes the query fragment, else false.
 */
function passesQueryFragment<T extends Schema>(entity: EntityIndex, fragment: EntityQueryFragment<T>): boolean {
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

/**
 * Helper function to check whether a query fragment is "positive" (ie `Has` or `HasValue`)
 *
 * @param fragment Query fragment to check.
 * @returns True if the query fragment is positive, else false.
 */
function isPositiveFragment<T extends Schema>(
  fragment: QueryFragment<T>
): fragment is HasQueryFragment<T> | HasValueQueryFragment<T> {
  return fragment.type === QueryFragmentType.Has || fragment.type == QueryFragmentType.HasValue;
}

/**
 * Helper function to check whether a query fragment is "negative" (ie `Not` or `NotValue`)
 *
 * @param fragment Query fragment to check.
 * @returns True if the query fragment is negative, else false.
 */
function isNegativeFragment<T extends Schema>(
  fragment: QueryFragment<T>
): fragment is NotQueryFragment<T> | NotValueQueryFragment<T> {
  return fragment.type === QueryFragmentType.Not || fragment.type == QueryFragmentType.NotValue;
}

/**
 * Helper function to check whether a query fragment is a setting fragment (ie `ProxyExpand` or `ProxyRead`)
 *
 * @param fragment Query fragment to check.
 * @returns True if the query fragment is a setting fragment, else false.
 */
function isSettingFragment<T extends Schema>(fragment: QueryFragment<T>): fragment is SettingQueryFragment {
  return fragment.type === QueryFragmentType.ProxyExpand || fragment.type == QueryFragmentType.ProxyRead;
}

/**
 * Helper function to check whether the result of a query pass check is a breaking state.
 *
 * @remarks
 * For positive fragments (Has/HasValue) we need to find any passing entity up the proxy chain
 * so as soon as passes is true, we can early return. For negative fragments (Not/NotValue) every entity
 * up the proxy chain must pass, so we can early return if we find one that doesn't pass.
 *
 * @param passes Boolean result of previous query pass check.
 * @param fragment Fragment that was used in the query pass check.
 * @returns True if the result is breaking pass state, else false.
 */
function isBreakingPassState(passes: boolean, fragment: EntityQueryFragment<Schema>) {
  return (passes && isPositiveFragment(fragment)) || (!passes && isNegativeFragment(fragment));
}

/**
 * Helper function to check whether an entity passes a query fragment when taking into account a {@link ProxyReadQueryFragment}.
 *
 * @param entity {@link EntityIndex} of the entity to check.
 * @param fragment Query fragment to check.
 * @param proxyRead {@link ProxyReadQueryFragment} to take into account.
 * @returns True if the entity passes the query fragment, else false.
 */
function passesQueryFragmentProxy<T extends Schema>(
  entity: EntityIndex,
  fragment: EntityQueryFragment<T>,
  proxyRead: ProxyReadQueryFragment
): boolean | null {
  let proxyEntity = entity;
  let passes = false;
  for (let i = 0; i < proxyRead.depth; i++) {
    const value = getComponentValue(proxyRead.component, proxyEntity);
    // If the current entity does not have the proxy component, abort
    if (!value) return null;

    const entityId = value.value;
    const entityIndex = proxyRead.component.world.entityToIndex.get(entityId);
    if (entityIndex === undefined) return null;

    // Move up the proxy chain
    proxyEntity = entityIndex;
    passes = passesQueryFragment(proxyEntity, fragment);

    if (isBreakingPassState(passes, fragment)) {
      return passes;
    }
  }
  return passes;
}

/**
 * Recursively compute all direct and indirect child entities up to the specified depth
 * down the relationship chain defined by the given component.
 *
 * @param entity Entity to get all child entities for up to the specified depth
 * @param component Component to use for the relationship chain.
 * @param depth Depth up to which the recursion should be applied.
 * @returns Set of entities that are child entities of the given entity via the given component.
 */
export function getChildEntities(
  entity: EntityIndex,
  component: Component<{ value: Type.Entity }>,
  depth: number
): Set<EntityIndex> {
  if (depth === 0) return new Set();

  const entityId = component.world.entities[entity];
  const directChildEntities = getEntitiesWithValue(component, { value: entityId });
  if (depth === 1) return directChildEntities;

  const indirectChildEntities = [...directChildEntities]
    .map((childEntity) => [...getChildEntities(childEntity, component, depth - 1)])
    .flat();

  return new Set([...directChildEntities, ...indirectChildEntities]);
}

/**
 * Execute a list of query fragments to receive a Set of matching entities.
 *
 * @remarks
 * The query fragments are executed from left to right and are concatenated with a logical `AND`.
 * For performance reasons, the most restrictive query fragment should be first in the list of query fragments,
 * in order to reduce the number of entities the next query fragment needs to be checked for.
 * If no proxy fragments are used, every entity in the resulting set passes every query fragment.
 * If setting fragments are used, the order of the query fragments influences the result, since settings only apply to
 * fragments after the setting fragment.
 *
 * @param fragments Query fragments to execute.
 * @param initialSet Optional: provide a Set of entities to execute the query on. If none is given, all existing entities are used for the query.
 * @returns Set of entities matching the query fragments.
 */
export function runQuery(fragments: QueryFragment[], initialSet?: Set<EntityIndex>): Set<EntityIndex> {
  let entities: Set<EntityIndex> | undefined = initialSet ? new Set([...initialSet]) : undefined; // Copy to a fresh set because it will be modified in place
  let proxyRead: ProxyReadQueryFragment | undefined = undefined;
  let proxyExpand: ProxyExpandQueryFragment | undefined = undefined;

  // Process fragments
  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
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
          ? new Set([...getComponentEntities(fragment.component)])
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
        let passes = passesQueryFragment(entity, fragment);

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

  return entities ?? new Set<EntityIndex>();
}

/**
 * Create a query object including an update$ stream and a Set of entities currently matching the query.
 *
 * @remarks
 * `update$` stream needs to be subscribed to in order for the logic inside the stream to be executed and therefore
 * in order for the `matching` set to be updated.
 *
 * `defineQuery` should be strongly preferred over `runQuery` if the query is used for systems or other
 * use cases that repeatedly require the query result or updates to the query result. `defineQuery` does not
 * reevaluate the entire query if an accessed component changes, but only performs the minimal set of checks
 * on the updated entity to evaluate wether the entity still matches the query, resulting in significant performance
 * advantages over `runQuery`.
 *
 * The query fragments are executed from left to right and are concatenated with a logical `AND`.
 * For performance reasons, the most restrictive query fragment should be first in the list of query fragments,
 * in order to reduce the number of entities the next query fragment needs to be checked for.
 * If no proxy fragments are used, every entity in the resulting set passes every query fragment.
 * If setting fragments are used, the order of the query fragments influences the result, since settings only apply to
 * fragments after the setting fragment.
 *
 * @param fragments Query fragments to execute.
 * @param options Optional: {
 *   runOnInit: if true, the query is executed once with `runQuery` to build an iniital Set of matching entities. If false only updates after the query was created are considered.
 *   initialSet: if given, this set is passed to `runOnInit` when building the initial Set of matching entities.
 * }
 * @returns Query object: {
 *  update$: RxJS stream of updates to the query result. The update contains the component update that caused the query update, as well as the {@link UpdateType update type}.
 *  matching: Mobx observable set of entities currently matching the query.
 * }.
 */
export function defineQuery(
  fragments: QueryFragment[],
  options?: { runOnInit?: boolean; initialSet?: Set<EntityIndex> }
): {
  update$: Observable<ComponentUpdate & { type: UpdateType }>;
  matching: ObservableSet<EntityIndex>;
} {
  const initialSet =
    options?.runOnInit || options?.initialSet ? runQuery(fragments, options.initialSet) : new Set<EntityIndex>();

  const matching = observable(initialSet);
  const initial$ = from(matching).pipe(toUpdateStream(fragments[0].component));

  const containsProxy =
    fragments.findIndex((v) => [QueryFragmentType.ProxyExpand, QueryFragmentType.ProxyRead].includes(v.type)) !== -1;

  const internal$ = merge(...fragments.map((f) => f.component.update$)) // Combine all component update streams accessed accessed in this query
    .pipe(
      containsProxy // Query contains proxies
        ? concatMap((update) => {
            // If the query contains proxy read or expand fragments, entities up or down the proxy chain might match due to this update.
            // We have to run the entire query again and compare the result.
            // TODO: We might be able to make this more efficient by first computing the set of entities that are potentially touched by this update
            // and then only rerun the query on this set.
            const newMatchingSet = runQuery(fragments, options?.initialSet);
            const updates: (ComponentUpdate & { type: UpdateType })[] = [];

            for (const previouslyMatchingEntity of matching) {
              // Entity matched before but doesn't match now
              if (!newMatchingSet.has(previouslyMatchingEntity)) {
                matching.delete(previouslyMatchingEntity);
                updates.push({
                  entity: previouslyMatchingEntity,
                  type: UpdateType.Exit,
                  component: update.component,
                  value: [undefined, undefined],
                });
              }
            }

            for (const matchingEntity of newMatchingSet) {
              if (matching.has(matchingEntity)) {
                // Entity matched before and still matches
                updates.push({
                  entity: matchingEntity,
                  type: UpdateType.Update,
                  component: update.component,
                  value: [getComponentValue(update.component, matchingEntity), undefined],
                });
              } else {
                // Entity didn't match before but matches now
                matching.add(matchingEntity);
                updates.push({
                  entity: matchingEntity,
                  type: UpdateType.Enter,
                  component: update.component,
                  value: [getComponentValue(update.component, matchingEntity), undefined],
                });
              }
            }

            return of(...updates);
          })
        : // Query does not contain proxies
          map((update) => {
            if (matching.has(update.entity)) {
              // If this entity matched the query before, check if it still matches it
              // Find fragments accessign this component (linear search is fine since the number fragments is likely small)
              const relevantFragments = fragments.filter((f) => f.component.id === update.component.id);
              const pass = relevantFragments.every((f) => passesQueryFragment(update.entity, f as EntityQueryFragment)); // We early return if the query contains proxies

              if (pass) {
                // Entity passed before and still passes, forward update
                return { ...update, type: UpdateType.Update };
              } else {
                // Entity passed before but not anymore, forward update and exit
                matching.delete(update.entity);
                return { ...update, type: UpdateType.Exit };
              }
            }

            // This entity didn't match before, check all fragments
            const pass = fragments.every((f) => passesQueryFragment(update.entity, f as EntityQueryFragment)); // We early return if the query contains proxies
            if (pass) {
              // Entity didn't pass before but passes now, forward update end enter
              matching.add(update.entity);
              return { ...update, type: UpdateType.Enter };
            }
          }),
      filterNullish()
    );

  // Create a new Subject to allow multiple observers
  // but only subscribe to the internal stream when the update stream is
  // subscribed to, in order to get the same behavior as if exposing the
  // internal stream directly (ie only running the internal$ pipe if there are subscribers)
  const update$ = new Subject<ComponentUpdate & { type: UpdateType }>();
  const world = fragments[0].component.world;
  const subscribe = update$.subscribe.bind(update$);
  update$.subscribe = (observer) => {
    const subscription = internal$.subscribe(update$);
    world.registerDisposer(() => subscription?.unsubscribe());
    return subscribe(observer as Parameters<typeof subscribe>[0]);
  };

  return {
    matching,
    update$: concat(initial$, update$),
  };
}

/**
 * Define a query object that only passes update events of type {@link UpdateType}.Update to the `update$` stream.
 * See {@link defineQuery} for details.
 *
 * @param fragments Query fragments
 * @returns Stream of component updates of entities that had already matched the query
 */
export function defineUpdateQuery(
  fragments: QueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate & { type: UpdateType }> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Update));
}

/**
 * Define a query object that only passes update events of type {@link UpdateType}.Enter to the `update$` stream.
 * See {@link defineQuery} for details.
 *
 * @param fragments Query fragments
 * @returns Stream of component updates of entities matching the query for the first time
 */
export function defineEnterQuery(
  fragments: QueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Enter));
}

/**
 * Define a query object that only passes update events of type {@link UpdateType}.Exit to the `update$` stream.
 * See {@link defineQuery} for details.
 *
 * @param fragments Query fragments
 * @returns Stream of component updates of entities not matching the query anymore for the first time
 */
export function defineExitQuery(
  fragments: QueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Exit));
}
