import { defineComponent, World, Type, Component, Metadata, SchemaOf } from "@latticexyz/recs";

export function defineActionComponent<T = undefined>(world: World) {
  const Action = defineComponent(
    world,
    { state: Type.Number, on: Type.OptionalEntity, metadata: Type.T },
    { id: "Action" }
  );
  return Action as Component<SchemaOf<typeof Action>, Metadata, T>;
}
