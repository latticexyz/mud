import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineRockWallComponent(world: World) {
  return defineComponent(world, { value: Type.Boolean });
}
