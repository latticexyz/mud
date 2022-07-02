import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineHueTintComponent(world: World) {
  return defineComponent(world, { value: Type.Number }, { id: "HueTint" });
}
