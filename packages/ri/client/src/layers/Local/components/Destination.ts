import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineDestinationComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "Destination" });
}
