import { World, defineComponent, Type, Component, Schema, Metadata } from "@latticexyz/recs";
import { Table } from "../common";

export type InternalComponents = ReturnType<typeof defineInternalComponents>;

export function defineInternalComponents(world: World) {
  return {
    /** @deprecated */
    RegisteredTables: defineComponent<{ table: Type.T }, Metadata, Table>(
      world,
      { table: Type.T },
      { metadata: { componentName: "RegisteredTables" } },
    ),
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
