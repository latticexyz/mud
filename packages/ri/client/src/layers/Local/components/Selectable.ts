import { World, defineComponent } from "@mudkit/recs";
export function defineSelectableComponent(world: World) {
  return defineComponent(world, {}, { name: "Selectable" });
}
