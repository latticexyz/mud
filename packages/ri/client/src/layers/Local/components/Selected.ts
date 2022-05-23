import { World, defineComponent } from "@mudkit/recs";
export function defineSelectedComponent(world: World) {
  return defineComponent(world, {}, { name: "Selected" });
}
