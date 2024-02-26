import { StaticAbiType } from "@latticexyz/schema-type/deprecated";
import { Error } from "./error";
import { AbiType, Schema, getDynamicAbiTypeKeys, getStaticAbiTypeKeys } from "./schema";

/**
 * TODO
 * - Utils for resolving shorthand config into full config
 * - Splitting up into more smaller helper utils
 * - How can we create an error if the config doesn't match?
 */

export type NonStaticKeyFieldError = Error<"`key` field must be static if no keys override is provided">;

export type TableConfigInput<schema extends Schema = Schema> = TableFullConfigInput<schema> | TableShorthandConfigInput;

export type TableShorthandConfigInput = Schema | AbiType;

export type TableFullConfigInput<
  schema extends Schema = Schema,
  keys extends getStaticAbiTypeKeys<schema>[] = getStaticAbiTypeKeys<schema>[]
> = {
  schema: schema;
  keys: keys;
};

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults.
 */
export type resolveTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? // If a single ABI type is provided as shorthand, expand it with a default `bytes32` key
    TableFullConfigInput<{ key: "bytes32"; value: input }, ["key"]>
  : input extends Schema
  ? "key" extends getStaticAbiTypeKeys<input>
    ? // If the shorthand includes a static field called `key`, use it as key
      TableFullConfigInput<input, ["key"]>
    : // If the shorthand includes a non-static field called `key`, return an error
    "key" extends keyof input
    ? NonStaticKeyFieldError
    : // If `key` is not part of the shorthand fields, add a default `bytes32` key
      // TODO @David: why does this line not work
      // TableFullConfigInput<input & { key: "bytes32" }, ["key"]>
      resolveTableShorthandConfig<input & { key: "bytes32" }>
  : never;

export function resolveTableShorthandConfig<input extends TableShorthandConfigInput>(
  input: input
): resolveTableShorthandConfig<input> {
  // TODO: runtime
  return input as resolveTableShorthandConfig<input>;
}

export type resolveTableConfig<tableConfigInput extends TableConfigInput> = tableConfigInput extends SchemaConfigInput
  ? // If the table config input is a schema shorthand...
    resolveTableConfig<TableFullConfigInput<tableConfigInput>>
  : tableConfigInput extends TableFullConfigInput<infer schema>
  ? // If the table config input is a full table config
    tableConfigInput["keys"][number] extends extractStaticAbiKeys<schema>
    ? // If the keys are a subset of fields with static ABI
      {
        keySchema: Pick<schema, tableConfigInput["keys"][number]>;
        valueSchema: Omit<resolveSchemaConfig<schema>, tableConfigInput["keys"][number]>;
        schema: resolveSchemaConfig<schema>;
        keys: tableConfigInput["keys"];
      }
    : // Otherwise
      ErrorInvalidKeys<{
        expected: extractStaticAbiKeys<schema>;
        received: tableConfigInput["keys"][number];
      }>
  : tableConfigInput extends TableFullConfigInput
  ? ErrorInvalidKeys<{ expected: keyof tableConfigInput["schema"]; received: tableConfigInput["keys"][number] }>
  : never;

export function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<tableConfigInput>;
}

export type ErrorInvalidKeys<metadata = null> = Error<
  "keys must be a subset of the fields with static ABI types in the schema",
  metadata
>;
