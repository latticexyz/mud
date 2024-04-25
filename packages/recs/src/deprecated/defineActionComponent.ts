import { defineComponent } from "../Component";
import { Type } from "../constants";
import { World, Component, SchemaOf, Metadata } from "../types";

export function defineActionComponent<T = unknown>(world: World) {
  const Action = defineComponent(
    world,
    {
      state: Type.String,
      on: Type.OptionalEntity,
      metadata: Type.OptionalT,
      overrides: Type.OptionalStringArray,
      txHash: Type.OptionalString,
    },
    { id: "Action" }
  );
  return Action as Component<SchemaOf<typeof Action>, Metadata, T>;
}
