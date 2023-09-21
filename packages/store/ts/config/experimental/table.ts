import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";
import { isPlainObject } from "./common";
import { KeySchemaInput, KeySchemaOutput, parseKeySchema } from "./keySchema";
import { ValueSchemaInput, ValueSchemaOutput, parseValueSchema } from "./valueSchema";
import { assertExhaustive } from "@latticexyz/common/utils";
import { tableIdToHex } from "@latticexyz/common";

export type TableShapeInput = Readonly<{
  namespace?: string;
  keySchema?: KeySchemaInput;
  valueSchema: ValueSchemaInput;
  offchainOnly?: boolean;
}>;

// TODO: add support for ValueSchemaInput instead of SchemaAbiType?
//       requires an isValueSchemaInput helper that is distinct enough from isTableInputShape
export type TableInput = SchemaAbiType | TableShapeInput;

export type TableOutput<
  defaultNamespace extends string,
  name extends string,
  input extends TableInput
> = input extends SchemaAbiType
  ? TableOutput<defaultNamespace, name, { valueSchema: input }>
  : input extends TableShapeInput
  ? Readonly<{
      type: input["offchainOnly"] extends true ? "offchainTable" : "table";
      namespace: input["namespace"] extends string ? input["namespace"] : defaultNamespace;
      name: name;
      tableId: `0x${string}`;
      keySchema: KeySchemaOutput<
        input["keySchema"] extends KeySchemaInput
          ? input["keySchema"]
          : never extends input["keySchema"]
          ? undefined
          : never
      >;
      valueSchema: ValueSchemaOutput<input["valueSchema"]>;
    }>
  : never;

/** @internal */
export const tableInputShapeKeys = ["namespace", "keySchema", "valueSchema", "offchainOnly"] as const;

// TODO: is there a better way to check this aside from just looking at the shape/keys of the object?
export function isTableShapeInput(input: unknown): input is TableShapeInput {
  if (!isPlainObject(input)) return false;
  if (Object.keys(input).some((key) => !tableInputShapeKeys.includes(key as (typeof tableInputShapeKeys)[number])))
    return false;
  return true;
}

export function parseTable<defaultNamespace extends string, name extends string, input extends TableInput>(
  defaultNamespace: defaultNamespace,
  name: name,
  input: input
): TableOutput<defaultNamespace, name, input> {
  return (
    isSchemaAbiType(input)
      ? parseTable(defaultNamespace, name, { valueSchema: input })
      : isTableShapeInput(input)
      ? {
          type: input.offchainOnly === true ? "offchainTable" : "table",
          namespace: input.namespace ?? defaultNamespace,
          name,
          tableId: tableIdToHex(input.namespace ?? defaultNamespace, name),
          keySchema: parseKeySchema(input.keySchema),
          valueSchema: parseValueSchema(input.valueSchema),
        }
      : assertExhaustive(input, "invalid table input")
  ) as TableOutput<defaultNamespace, name, input>;
}
