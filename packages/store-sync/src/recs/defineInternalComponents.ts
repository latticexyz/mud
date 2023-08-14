import { World, defineComponent, Type, Component, Schema } from "@latticexyz/recs";
import { Table } from "../common";
import { StoreComponentMetadata } from "./common";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function defineInternalComponents(world: World) {
  return {
    TableMetadata: defineComponent<{ table: Type.T }, StoreComponentMetadata, Table>(
      world,
      { table: Type.T },
      {
        metadata: {
          componentName: "TableMetadata",
          tableName: "recs:TableMetadata",
          keySchema: {},
          valueSchema: {},
        },
      }
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
      {
        metadata: {
          componentName: "SyncProgress",
          tableName: "recs:SyncProgress",
          keySchema: {},
          valueSchema: {},
        },
      }
    ),
  } as const satisfies Record<string, Component<Schema, StoreComponentMetadata>>;
}
