import { filterNullish } from "@latticexyz/utils";
import { observable, ObservableSet } from "mobx";
import { concat, concatMap, EMPTY, filter, from, map, merge, Observable, of } from "rxjs";
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

export function ProxyRead(component: Component<{ value: Type.Entity }>, depth: number): ProxyReadQueryFragment {
  return { type: QueryFragmentType.ProxyRead, component, depth };
}

export function ProxyExpand(component: Component<{ value: Type.Entity }>, depth: number): ProxyExpandQueryFragment {
  return { type: QueryFragmentType.ProxyExpand, component, depth };
}

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
 * Recursively computes all direct and indirect child entities up to the specified depth
 * @param entity Entity to get all child entities up to the specified depth
 * @param component Entity reference component
 * @param depth Depth up to which the recursion should be applied
 * @returns Set of entities that are child entities of the given entity via the given component
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

export function runQuery(fragments: QueryFragment[], initialSet?: Set<EntityIndex>): Set<EntityIndex> {
  let entities: Set<EntityIndex> | undefined = initialSet;
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
 * @param fragments Query fragments
 * @returns Stream of updates for entities that are matching the query or used to match and now stopped matching the query
 * Note: runOnInit was removed in V2. Make sure your queries are defined before any component update events arrive.
 */
export function defineQuery(
  fragments: QueryFragment[],
  options?: { runOnInit?: boolean; initialSet?: Set<EntityIndex> }
): {
  update$: Observable<ComponentUpdate & { type: UpdateType }>;
  matching: ObservableSet<EntityIndex>;
} {
  const initialSet = options?.runOnInit
    ? runQuery(fragments, options.initialSet)
    : options?.initialSet || new Set<EntityIndex>();

  const matching = observable(initialSet);
  const initial$ = from(matching).pipe(toUpdateStream(fragments[0].component));

  const containsProxyRead = fragments.findIndex((v) => v.type === QueryFragmentType.ProxyRead) !== -1;
  const containsProxyExpand = fragments.findIndex((v) => v.type === QueryFragmentType.ProxyExpand) !== -1;
  console.log("Proxy", containsProxyRead, containsProxyExpand);

  const update$ = concat(
    initial$,
    merge(...fragments.map((f) => f.component.update$)) // Combine all component update streams accessed accessed in this query
      .pipe(
        map((e) => {
          console.log("update", e);
          return e;
        }),
        concatMap((update) => {
          console.log("got update");
          // If the query contains proxy read or expand fragments, entities up or down the proxy chain might match due to this update.
          // We have to run the entire query again and compare the result.
          // TODO: We might be able to make this more efficient by first computing the set of entities that are potentially touched by this update
          // and then only rerun the query on this set.
          if (containsProxyExpand || containsProxyRead) {
            console.log("Contains proxy");
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
          }

          if (matching.has(update.entity)) {
            // If this entity matched the query before, check if it still matches it
            // Find fragments accessign this component (linear search is fine since the number fragments is likely small)
            const relevantFragments = fragments.filter((f) => f.component.id === update.component.id);
            const pass = relevantFragments.every((f) => passesQueryFragment(update.entity, f as EntityQueryFragment));

            if (pass) {
              // Entity passed before and still passes, forward update
              return of({ ...update, type: UpdateType.Update });
            } else {
              // Entity passed before but not anymore, forward update and exit
              matching.delete(update.entity);
              return of({ ...update, type: UpdateType.Exit });
            }
          }

          // This entity didn't match before, check all fragments
          const pass = fragments.every((f) => passesQueryFragment(update.entity, f as EntityQueryFragment));
          if (pass) {
            // Entity didn't pass before but passes now, forward update end enter
            matching.add(update.entity);
            return of({ ...update, type: UpdateType.Enter });
          }

          return EMPTY;
        }),
        filterNullish()
      )
  );

  return {
    matching,
    update$,
  };
}

/**
 * @param fragments Query fragments
 * @returns Stream of component updates of entities that had already matched the query
 */
export function defineUpdateQuery(
  fragments: EntityQueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate & { type: UpdateType }> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Update));
}

/**
 * @param fragments Query fragments
 * @returns Stream of component updates of entities matching the query for the first time
 */
export function defineEnterQuery(
  fragments: EntityQueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Enter));
}

/**
 * @param fragments Query fragments
 * @returns Stream of component updates of entities not matching the query anymore for the first time
 */
export function defineExitQuery(
  fragments: EntityQueryFragment[],
  options?: { runOnInit?: boolean }
): Observable<ComponentUpdate> {
  return defineQuery(fragments, options).update$.pipe(filter((e) => e.type === UpdateType.Exit));
}
