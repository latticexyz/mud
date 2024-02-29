import { error } from "./error";
import { AbiType, SchemaInput, UserTypes, getStaticAbiTypeKeys, resolveSchema } from "./schema";
import { stringifyUnion } from "@arktype/util";

export type NoStaticKeyFieldError =
  error<"Provide a `key` field with static ABI type or a full config with explicit keys override.">;
export type InvalidInput = error<"Provide a valid shorthand or full table config.">;
// @alvrs I added @arktype/util (already transitive of arktype anyways) which has a bunch of type-level utilities like
// this one for string unions which are otherwise quite messy to do from scratch
export type InvalidKeys<validKey extends string> =
  `Keys must have static ABI types (${stringifyUnion<validKey>} are allowed)`;

export type TableConfigInput<
  schema extends SchemaInput = SchemaInput,
  keys extends ValidKeys<schema> = ValidKeys<schema>
> = TableFullConfigInput<schema, keys> | TableShorthandConfigInput;

export type TableShorthandConfigInput = AbiType | SchemaInput;

// @alvrs Make sure if you are ever wanting to compare against an array like
// this you add `readonly` to it
export type ValidKeys<schema extends SchemaInput> = readonly [
  getStaticAbiTypeKeys<schema>,
  ...getStaticAbiTypeKeys<schema>[]
];

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

export type validateTableConfig<input> = input extends TableShorthandConfigInput
  ? validateTableShorthandConfig<input>
  : input extends TableFullConfigInput
  ? validateTableFullConfig<input>
  : TableFullConfigInput | TableShorthandConfigInput;

type validateTableFullConfig<input extends TableFullConfigInput> = {
  [k in keyof input]: k extends "keys" ? validateKeys<input[k], getStaticAbiTypeKeys<input["schema"]>> : input[k];
};

type validateKeys<keys, validKey extends PropertyKey> = {
  [i in keyof keys]: keys[i] extends validKey ? keys[i] : validKey;
};

type resolveTableFullConfig<input extends TableFullConfigInput, userTypes extends UserTypes> = {
  keys: input["keys"];
  schema: resolveSchema<input["schema"], userTypes>;
  keySchema: resolveSchema<
    {
      [key in input["keys"][number]]: input["schema"][key];
    },
    userTypes
  >;
  valueSchema: resolveSchema<
    {
      [key in Exclude<keyof input["schema"], input["keys"][number]>]: input["schema"][key];
    },
    userTypes
  >;
};

export type resolveTableConfig<input, userTypes extends UserTypes> = input extends TableShorthandConfigInput
  ? resolveTableConfig<resolveTableShorthandConfig<input>, userTypes>
  : input extends TableFullConfigInput
  ? resolveTableFullConfig<input, userTypes>
  : never;

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input, userTypes extends UserTypes = UserTypes>(
  input: validateTableConfig<input>,
  userTypes?: userTypes
): resolveTableConfig<input, userTypes> {
  // TODO: runtime implementation
  return {} as never;
}
