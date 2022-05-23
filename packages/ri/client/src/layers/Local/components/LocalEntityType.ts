import { defineComponent, Type, World } from "@mudkit/recs";

export function defineLocalEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number }, { name: "LocalEntityType" });
}
