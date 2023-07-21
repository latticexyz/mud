import { World, defineComponent, Type } from "@latticexyz/recs";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function defineInternalComponents(world: World) {
  return {
    TableMetadata: defineComponent(
      world,
      {
        // TODO: figure out how to more strongly type this value without having to redefine the schema/metadata in the type signature
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
