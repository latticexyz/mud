import { World, defineComponent } from "@latticexyz/recs";
export function defineSelectableComponent(world: World) {
  return defineComponent(world, {}, { name: "Selectable" });
}
