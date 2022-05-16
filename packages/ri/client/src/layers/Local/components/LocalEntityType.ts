import { defineComponent, Type, World } from "@mud/recs";

export function defineLocalEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number }, { name: "LocalEntityType" });
}
