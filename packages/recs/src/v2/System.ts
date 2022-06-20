import { Observable } from "rxjs";
import { UpdateType } from "./constants";
import { defineEnterQuery, defineExitQuery, defineQuery, defineUpdateQuery } from "./Query";
import { ComponentUpdate, EntityQueryFragment, World } from "./types";

function defineRxSystem<T>(world: World, observable$: Observable<T>, system: (event: T) => void) {
  const subscription = observable$.subscribe(system);
  world.registerDisposer(() => subscription?.unsubscribe());
}

export function defineUpdateSystem(
  world: World,
  fragments: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  return defineRxSystem(world, defineUpdateQuery(fragments), system);
}

export function defineEnterSystem(
  world: World,
  fragments: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  return defineRxSystem(world, defineEnterQuery(fragments), system);
}

export function defineExitSystem(
  world: World,
  fragments: EntityQueryFragment[],
  system: (update: ComponentUpdate) => void
) {
  return defineRxSystem(world, defineExitQuery(fragments), system);
}

export function defineSystem(
  world: World,
  fragments: EntityQueryFragment[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void
) {
  return defineRxSystem(world, defineQuery(fragments).update$, system);
}
