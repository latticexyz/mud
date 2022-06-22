import { World, defineComponent, Type } from "@latticexyz/recs";
export function defineSelectableComponent(world: World) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Selectable" });
}
