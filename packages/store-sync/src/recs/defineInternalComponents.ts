import { World, defineComponent, Type, Component, Schema, Metadata } from "@latticexyz/recs";

export type InternalComponents = ReturnType<typeof defineInternalComponents>;

export function defineInternalComponents(world: World) {
  return {
    SyncProgress: defineComponent(
      world,
      {
        step: Type.String,
        message: Type.String,
        percentage: Type.Number,
        latestBlockNumber: Type.BigInt,
        lastBlockNumberProcessed: Type.BigInt,
      },
      { metadata: { componentName: "SyncProgress" } },
    ),
  } as const satisfies Record<string, Component<Schema, Metadata>>;
}
