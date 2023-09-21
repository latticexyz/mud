import { StaticAbiType, isStaticAbiType } from "@latticexyz/schema-type";

export type KeySchema = Readonly<Record<string, StaticAbiType>>;

export const defaultKeySchema = { key: "bytes32" } as const satisfies KeySchema;

export type ParseKeySchemaInput = StaticAbiType | KeySchema | undefined;

export type ParseKeySchemaOutput<input extends ParseKeySchemaInput> = input extends undefined
  ? typeof defaultKeySchema
  : input extends StaticAbiType
  ? Readonly<{ key: input }>
  : input extends KeySchema
  ? Readonly<input>
  : never;

export function parseKeySchema<input extends ParseKeySchemaInput>(input: input): ParseKeySchemaOutput<input> {
  return (
    input === undefined ? defaultKeySchema : isStaticAbiType(input) ? { key: input } : input
  ) as ParseKeySchemaOutput<input>;
}
