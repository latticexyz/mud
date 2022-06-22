import { World, defineComponent, Type } from "@latticexyz/recs";

export function defineSelectionComponent(world: World) {
  return defineComponent(
    world,
    { x: Type.Number, y: Type.Number, width: Type.Number, height: Type.Number },
    { name: "Selection" }
  );
}
