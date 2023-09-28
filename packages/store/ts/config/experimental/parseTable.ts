import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";
import { isPlainObject } from "./common";
import { ParseKeySchemaInput, ParseKeySchemaOutput, parseKeySchema } from "./parseKeySchema";
import { ParseValueSchemaInput, ParseValueSchemaOutput, parseValueSchema } from "./parseValueSchema";
import { assertExhaustive } from "@latticexyz/common/utils";
import { resourceIdToHex } from "@latticexyz/common";

/** @internal */
export type TableShapeInput = Readonly<{
  namespace?: string;
  keySchema?: ParseKeySchemaInput;
  valueSchema: ParseValueSchemaInput;
  offchainOnly?: boolean;
}>;

// TODO: add support for ParseValueSchemaInput instead of SchemaAbiType?
//       requires an isValueSchemaInput helper that is distinct enough from isParseTableInputShape
export type ParseTableInput = SchemaAbiType | TableShapeInput;

export type ParseTableOutput<
  defaultNamespace extends string,
  name extends string,
  input extends ParseTableInput
> = input extends SchemaAbiType
  ? ParseTableOutput<defaultNamespace, name, { valueSchema: input }>
  : input extends TableShapeInput
  ? Readonly<{
      type: input["offchainOnly"] extends true ? "offchainTable" : "table";
      namespace: input["namespace"] extends string ? input["namespace"] : defaultNamespace;
      name: name;
      tableId: `0x${string}`;
      keySchema: ParseKeySchemaOutput<
        input["keySchema"] extends ParseKeySchemaInput
          ? input["keySchema"]
          : never extends input["keySchema"]
          ? undefined
          : never
      >;
      valueSchema: ParseValueSchemaOutput<input["valueSchema"]>;
    }>
  : never;

// TODO: is there a better way to check this aside from just looking at the shape/keys of the object?

/** @internal */
export const tableInputShapeKeys = ["namespace", "keySchema", "valueSchema", "offchainOnly"] as const;

/** @internal */
export function isTableShapeInput(input: unknown): input is TableShapeInput {
  if (!isPlainObject(input)) return false;
  if (Object.keys(input).some((key) => !tableInputShapeKeys.includes(key as (typeof tableInputShapeKeys)[number])))
    return false;
  return true;
}

export function parseTable<defaultNamespace extends string, name extends string, input extends ParseTableInput>(
  defaultNamespace: defaultNamespace,
  name: name,
  input: input
): ParseTableOutput<defaultNamespace, name, input> {
  return (
    isSchemaAbiType(input)
      ? parseTable(defaultNamespace, name, { valueSchema: input })
      : isTableShapeInput(input)
      ? {
          type: input.offchainOnly === true ? "offchainTable" : "table",
          namespace: input.namespace ?? defaultNamespace,
          name,
          tableId: resourceIdToHex({
            type: input.offchainOnly === true ? "offchainTable" : "table",
            namespace: input.namespace ?? defaultNamespace,
            name,
          }),
          keySchema: parseKeySchema(input.keySchema),
          valueSchema: parseValueSchema(input.valueSchema),
        }
      : assertExhaustive(input, "invalid table input")
  ) as ParseTableOutput<defaultNamespace, name, input>;
}
