import { defineComponent, Type, World } from "@mud/recs";

export function defineDestinationComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, { name: "Destination" });
}
