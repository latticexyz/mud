import { World, defineComponent, Type, Component } from "@latticexyz/recs";
import { Table } from "../common";

function typedComponent<TType>(
  component: Component
): typeof component extends Component<infer TSchema, infer TMetadata> ? Component<TSchema, TMetadata, TType> : never {
  return component;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function defineInternalComponents(world: World) {
  return {
    TableMetadata: typedComponent<Table>(
      defineComponent(
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
      )
    ),
  };
}
