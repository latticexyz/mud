import { error } from "./error";
import { AbiType, Schema, getStaticAbiTypeKeys } from "./schema";
import { conform } from "./generics";

export type NoStaticKeyFieldError =
  error<"Provide a `key` field with static ABI type or a full config with explicit keys override.">;
export type InvalidInput = error<"Provide a valid shorthand or full table config.">;
// TODO: any way to have more details in the error here, ie `which keys would be valid keys`?
export type InvalidKeys = `Keys must have static ABI types.`;

export type TableConfigInput<schema extends Schema = Schema, keys extends ValidKeys<schema> = ValidKeys<schema>> =
  | TableFullConfigInput<schema, keys>
  | TableShorthandConfigInput;

export type TableShorthandConfigInput = AbiType | Schema;

export type ValidKeys<schema extends Schema> = [getStaticAbiTypeKeys<schema>, ...getStaticAbiTypeKeys<schema>[]];

export type TableFullConfigInput<schema extends Schema = Schema, keys extends ValidKeys<schema> = ValidKeys<schema>> = {
  schema: schema;
  keys: keys;
};

type validateTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? input
  : input extends Schema
  ? // If a shorthand schema is provided, require it to have a static key field
    "key" extends getStaticAbiTypeKeys<input>
    ? input
    : NoStaticKeyFieldError
  : InvalidInput;

export type resolveTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? // If a single ABI type is provided as shorthand, expand it with a default `bytes32` key
    TableFullConfigInput<{ key: "bytes32"; value: input }, ["key"]>
  : input extends Schema
  ? "key" extends getStaticAbiTypeKeys<input>
    ? // If the shorthand includes a static field called `key`, use it as key
      TableFullConfigInput<input, ["key"]>
    : never
  : never;

export function resolveTableShorthandConfig<input extends TableShorthandConfigInput>(
  input: validateTableShorthandConfig<input>
): resolveTableShorthandConfig<input> {
  // TODO: runtime implementatio
  return input as never;
}

type inferSchema<input extends TableConfigInput> = input extends TableFullConfigInput
  ? input["schema"]
  : input extends TableShorthandConfigInput
  ? resolveTableShorthandConfig<input>["schema"]
  : never;

type validateTableConfig<input> = input extends TableShorthandConfigInput
  ? validateTableShorthandConfig<input>
  : input extends TableFullConfigInput
  ? validateTableFullConfig<input>
  : never;

type validateTableFullConfig<input extends TableFullConfigInput> = input extends TableFullConfigInput
  ? input["keys"][number] extends getStaticAbiTypeKeys<input["schema"]>
    ? input
    : InvalidKeys
  : InvalidInput;

export type resolveTableConfig<input extends TableConfigInput> = input extends TableShorthandConfigInput
  ? resolveTableShorthandConfig<input>
  : input;

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input extends TableConfigInput>(
  // TODO: is combining conform and validate the right pattern here?
  //       Somehow without `conform` `keys` is inferred as `[string]`
  input: conform<input, TableConfigInput<inferSchema<input>>> & validateTableConfig<input>
): resolveTableConfig<input> {
  // TODO: runtime implementation
  return input as never;
}
