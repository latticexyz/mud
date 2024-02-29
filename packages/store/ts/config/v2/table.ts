import { error } from "./error";
import { AbiType, SchemaInput, getStaticAbiTypeKeys } from "./schema";
import { conform } from "./generics";

export type NoStaticKeyFieldError =
  error<"Provide a `key` field with static ABI type or a full config with explicit keys override.">;
export type InvalidInput = error<"Provide a valid shorthand or full table config.">;
// TODO: any way to have more details in the error here, ie `which keys would be valid keys`?
export type InvalidKeys = `Keys must have static ABI types.`;

export type TableConfigInput<
  schema extends SchemaInput = SchemaInput,
  keys extends ValidKeys<schema> = ValidKeys<schema>
> = TableFullConfigInput<schema, keys> | TableShorthandConfigInput;

export type TableShorthandConfigInput = AbiType | SchemaInput;

export type ValidKeys<schema extends SchemaInput> = [getStaticAbiTypeKeys<schema>, ...getStaticAbiTypeKeys<schema>[]];

export type TableFullConfigInput<
  schema extends SchemaInput = SchemaInput,
  keys extends ValidKeys<schema> = ValidKeys<schema>
> = {
  schema: schema;
  keys: keys;
};

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
type validateTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? input
  : input extends SchemaInput
  ? // If a shorthand schema is provided, require it to have a static key field
    "key" extends getStaticAbiTypeKeys<input>
    ? input
    : NoStaticKeyFieldError
  : InvalidInput;

export type resolveTableShorthandConfig<input extends TableShorthandConfigInput> = input extends AbiType
  ? // If a single ABI type is provided as shorthand, expand it with a default `bytes32` key
    TableFullConfigInput<{ key: "bytes32"; value: input }, ["key"]>
  : input extends SchemaInput
  ? "key" extends getStaticAbiTypeKeys<input>
    ? // If the shorthand includes a static field called `key`, use it as key
      TableFullConfigInput<input, ["key"]>
    : never
  : never;

export function resolveTableShorthandConfig<input extends TableShorthandConfigInput>(
  input: validateTableShorthandConfig<input>
): resolveTableShorthandConfig<input> {
  // TODO: runtime implementation
  return input as never;
}

export type inferSchema<input extends TableConfigInput> = input extends TableFullConfigInput
  ? input["schema"]
  : input extends SchemaInput
  ? resolveTableShorthandConfig<input>["schema"]
  : never;

export type validateTableConfig<
  input extends TableConfigInput,
  schema extends SchemaInput
> = input extends TableShorthandConfigInput
  ? validateTableShorthandConfig<input>
  : input extends TableFullConfigInput
  ? validateTableFullConfig<input, schema>
  : never;

type validateTableFullConfig<input extends TableFullConfigInput, schema extends SchemaInput> = conform<
  input,
  // TODO: why does typescript not infer the `keys` anymore if i change this to `input["schema"]`?
  TableFullConfigInput<schema>
>;

type resolveTableFullConfig<input extends TableFullConfigInput> = {
  keys: input["keys"];
  schema: input["schema"];
  keySchema: {
    [key in input["keys"][number]]: input["schema"][key];
  };
  valueSchema: {
    [key in Exclude<keyof input["schema"], input["keys"][number]>]: input["schema"][key];
  };
};

export type resolveTableConfig<input extends TableConfigInput> = input extends TableShorthandConfigInput
  ? resolveTableConfig<resolveTableShorthandConfig<input>>
  : input extends TableFullConfigInput
  ? resolveTableFullConfig<input>
  : never;

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input extends TableConfigInput>(
  input: validateTableConfig<input, inferSchema<input>>
): resolveTableConfig<input> {
  // TODO: runtime implementation
  return input as never;
}
