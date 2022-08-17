import { setComponent } from "./Component";
import { Component, ComponentValue, EntityID, EntityIndex, World } from "./types";

/**
 * Register a new entity in the given {@link World} and initialize it with the given {@link ComponentValue}s.
 *
 * @param world World object this entity should be registered in.
 * @param components Array of [{@link defineComponent Component}, {@link ComponentValue}] tuples to be added to this entity.
 * (Use {@link withValue} to generate these tuples with type safety.)
 * @param options Optional: {
 *   id: {@link EntityID} for this entity. Use this for entities that were created outside of recs, eg. in the corresponding solecs contracts.
 *   idSuffix: string to be appended to the auto-generated id. Use this for improved readability. Do not use this if the `id` option is provided.
 * }
 * @returns index of this entity in the {@link World}. This {@link EntityIndex} is used to refer to this entity in other recs methods (eg {@link setComponent}).
 * (This is to avoid having to store strings in every component.)
 */
export function createEntity(
  world: World,
  components?: [Component, ComponentValue][],
  options?: { id?: EntityID } | { idSuffix?: string }
): EntityIndex {
  const entity = world.registerEntity(options ?? {});

  if (components) {
    for (const [component, value] of components) {
      setComponent(component, entity, value);
    }
  }

  return entity;
}
