import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number });
}
