import { World, defineComponent } from "@latticexyz/recs";
export function defineSelectedComponent(world: World) {
  return defineComponent(world, {}, { name: "Selected" });
}
