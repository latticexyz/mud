import { World, defineComponent, Type as RecsType, Component } from "@latticexyz/recs";
import { Table } from "../common";
import { StoreComponentMetadata } from "./common";

declare const tag: unique symbol;

declare type Tagged<Token> = {
  readonly [tag]: Token;
};

type Opaque<Type, Token = unknown> = Type & Tagged<Token>;
type OpaqueBaseType<T> = T extends Opaque<infer Base, unknown> ? Base : never;
type OpaqueTokenType<T> = T extends Opaque<unknown, infer Token> ? Token : never;

function opaque<Token>(type: RecsType): Opaque<typeof type, Token> {
  return type as Opaque<typeof type, Token>;
}

const internalComponents = {
  TableMetadata: { value: opaque<Table>(RecsType.T) },
};

type InternalComponents = {
  [key in keyof typeof internalComponents]: Component<
    (typeof internalComponents)[key],
    StoreComponentMetadata,
    (typeof internalComponents)[key]["value"] extends Opaque<any>
      ? OpaqueTokenType<(typeof internalComponents)[key]["value"]>
      : unknown
  >;
};

export function defineInternalComponents(world: World): InternalComponents {
  return Object.fromEntries(
    Object.entries(internalComponents).map(([name, schema]) => [
      name,
      defineComponent(world, schema, { metadata: { keySchema: {}, valueSchema: {} } }),
    ])
  ) as InternalComponents;
  // return {
  //   TableMetadata: defineComponent<{ table: RecsType.T }, StoreComponentMetadata, Table>(
  //     world,
  //     { table: RecsType.T },
  //     { metadata: { keySchema: {}, valueSchema: {} } }
  //   ),
  // };
}
