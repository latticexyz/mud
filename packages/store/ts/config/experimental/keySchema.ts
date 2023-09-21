import { StaticAbiType, isStaticAbiType } from "@latticexyz/schema-type";

export type KeySchema = Readonly<Record<string, StaticAbiType>>;

export const defaultKeySchema = { key: "bytes32" } as const satisfies KeySchema;

export type KeySchemaInput = StaticAbiType | KeySchema | undefined;

export type KeySchemaOutput<input extends KeySchemaInput> = input extends undefined
  ? typeof defaultKeySchema
  : input extends StaticAbiType
  ? Readonly<{ key: input }>
  : input extends KeySchema
  ? Readonly<input>
  : never;

export function parseKeySchema<input extends KeySchemaInput>(input: input): KeySchemaOutput<input> {
  return (
    input === undefined ? defaultKeySchema : isStaticAbiType(input) ? { key: input } : input
  ) as KeySchemaOutput<input>;
}
