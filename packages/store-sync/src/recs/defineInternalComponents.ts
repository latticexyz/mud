import { World, defineComponent, Type, Component, Metadata, Schema } from "@latticexyz/recs";
import { Table } from "../common";

function typedComponent<TType>(
  component: Component
): typeof component extends Component<infer TSchema, infer TMetadata> ? Component<TSchema, TMetadata, TType> : never {
  return component;
}

function defineTypedComponent<TType, TSchema extends Schema = Schema, TMetadata extends Metadata = Metadata>(
  world: World,
  schema: TSchema,
  metadata?: TMetadata
): Component<TSchema, TMetadata, TType> {
  return defineComponent<TSchema, TMetadata, TType>(world, schema, metadata);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function defineInternalComponents(world: World) {
  return {
    TableMetadata: defineTypedComponent<Table>(
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
