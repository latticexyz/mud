import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineAppearanceComponent(world: World) {
  return defineComponent(world, { value: Type.Number }, { id: "Appearance" });
}
