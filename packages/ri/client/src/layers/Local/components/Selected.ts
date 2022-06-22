import { World, defineComponent, Type } from "@latticexyz/recs";
export function defineSelectedComponent(world: World) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Selected" });
}
