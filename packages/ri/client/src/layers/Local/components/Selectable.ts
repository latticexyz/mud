import { World, defineComponent } from "@mud/recs";
export function defineSelectableComponent(world: World) {
  return defineComponent(world, {}, { name: "Selectable" });
}
