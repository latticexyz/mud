import { BoundTable, TableRecord } from "./createStore";

// TODO: do these query fragment types make sense in the context of tables?

// f.k.a "Has"
type InQueryFragment = {
  type: "In";
  table: BoundTable;
};

// f.k.a. "HasValue"
type ValueQueryFragment = {
  type: "Value";
  table: BoundTable;
  value: TableRecord;
};

// f.k.a. "Not"
type NotInQueryFragment = {
  type: "NotIn";
  table: BoundTable;
};

// f.k.a. "NotValue"
type NotValueInQueryFragment = {
  type: "NotValue";
  table: BoundTable;
  value: TableRecord;
};

type QueryFragment = InQueryFragment | ValueQueryFragment | NotInQueryFragment | NotInQueryFragment;

/**
 * Helper function to check whether a given key passes a given query fragment.
 *
 * @param encodedKey Encoded key.
 * @param fragment Query fragment to check.
 * @returns True if the entity passes the query fragment, else false.
 */
function passesQueryFragment(encodedKey: string, fragment: QueryFragment): boolean {
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
export function runQuery(fragments: QueryFragment[], initialSet?: Set<Entity>): Set<Entity> {
  let entities: Set<Entity> | undefined = initialSet ? new Set([...initialSet]) : undefined; // Copy to a fresh set because it will be modified in place

  // Process fragments
  for (let i = 0; i < fragments.length; i++) {
    const fragment = fragments[i];
    if(!entities) {
    // Create the first interim result
    // TODO: what if initial set is required? 
    entities =
      fragment.type === QueryFragmentType.Has
        ? new Set([...getComponentEntities(fragment.component)])
        : getEntitiesWithValue(fragment.component, fragment.value);

  } else {
    // There already is an interim result, apply the current fragment
    for (const entity of [...entities]) {
      // Branch 1: Simple / check if the current entity passes the query fragment
      let passes = passesQueryFragment(entity, fragment);

      // If the entity didn't pass the query fragment, remove it from the interim set
      if (!passes) entities.delete(entity);
    }
  }

  return entities ?? new Set<Entity>();
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
  options?: { runOnInit?: boolean; initialSet?: Set<Entity> },
): {
  update$: Observable<ComponentUpdate & { type: UpdateType }>;
  matching: ObservableSet<Entity>;
} {
  const initialSet =
    options?.runOnInit || options?.initialSet ? runQuery(fragments, options.initialSet) : new Set<Entity>();

  const matching = observable(initialSet);
  const initial$ = from(matching).pipe(toUpdateStream(fragments[0].component));

  const containsProxy =
    fragments.findIndex((v) => [QueryFragmentType.ProxyExpand, QueryFragmentType.ProxyRead].includes(v.type)) !== -1;

  const internal$ = merge(...fragments.map((f) => f.component.update$)) // Combine all component update streams accessed accessed in this query
    .pipe(
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
      filterNullish(),
    );

  return {
    matching,
    update$: concat(initial$, internal$).pipe(share()),
  };
}