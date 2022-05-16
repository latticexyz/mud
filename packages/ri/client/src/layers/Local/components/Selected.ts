import { World, defineComponent } from "@mud/recs";
export function defineSelectedComponent(world: World) {
  return defineComponent(world, {}, { name: "Selected" });
}
