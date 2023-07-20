import { World, defineComponent, Type, Schema } from "@latticexyz/recs";
import { KeySchema, Table, ValueSchema } from "../common";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function defineInternalComponents(world: World) {
  return {
    TableMetadata: defineComponent(
      world,
      {
        table: Type.T,
      },
      {
        metadata: {
          contractId: "0x",
          keySchema: {},
          valueSchema: {},
        },
      }
    ),
  };
}
