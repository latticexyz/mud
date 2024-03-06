import { ErrorMessage, evaluate } from "@arktype/util";
import { SchemaInput, resolveSchema } from "./schema";
import { stringifyUnion } from "@arktype/util";
import { AbiType, AbiTypeScope, ScopeOptions, getStaticAbiTypeKeys } from "./scope";

export type NoStaticKeyFieldError =
  ErrorMessage<"Provide a `key` field with static ABI type or a full config with explicit keys override.">;
export type InvalidInput = ErrorMessage<"Provide a valid shorthand or full table config.">;
// @alvrs I added @arktype/util (already transitive of arktype anyways) which has a bunch of type-level utilities like
// this one for string unions which are otherwise quite messy to do from scratch
export type InvalidKeys<validKey extends string> =
  ErrorMessage<`Keys must have static ABI types (${stringifyUnion<validKey>} are allowed)`>;

// @alvrs Make sure if you are ever wanting to compare against an array like
// this you add `readonly` to it
export type ValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = [
  ...getStaticAbiTypeKeys<schema, scope>[]
];

export type TableInput<
  schema extends SchemaInput<scope>,
  scope extends AbiTypeScope = AbiTypeScope,
  keys extends ValidKeys<schema, scope> = ValidKeys<schema, scope>
> = TableFullConfigInput<schema, scope, keys> | TableShorthandConfigInput<scope>;

export type TableShorthandConfigInput<scope extends AbiTypeScope = AbiTypeScope> =
  | SchemaInput<scope>
  | keyof scope["allTypes"];

export type TableFullConfigInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  keys extends ValidKeys<schema, scope> = ValidKeys<schema, scope>
> = {
  schema: schema;
  keys: keys;
};

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
type validateTableShorthandConfig<input, scope extends AbiTypeScope = AbiTypeScope> = input extends SchemaInput<scope>
  ? // If a shorthand schema is provided, require it to have a static key field
    "key" extends getStaticAbiTypeKeys<input, scope>
    ? input
    : NoStaticKeyFieldError
  : input extends keyof scope["allTypes"]
  ? input
  : input extends string
  ? keyof scope["allTypes"]
  : SchemaInput<scope>;

export type resolveTableShorthandConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope
> = input extends SchemaInput<scope>
  ? "key" extends getStaticAbiTypeKeys<input, scope>
    ? // If the shorthand includes a static field called `key`, use it as key
      evaluate<TableFullConfigInput<input, scope, ["key"]>>
    : never
  : input extends keyof scope["allTypes"]
  ? resolveTableShorthandConfig<{ key: "bytes32"; value: input }, scope>
  : never;

export function resolveTableShorthandConfig<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableShorthandConfig<input, scope>,
  scope?: scope
): resolveTableShorthandConfig<input, scope> {
  // TODO: runtime implementation
  return input as never;
}

// Below this is before refactor ------------------------

export type inferSchema<input, userTypes extends UserTypes = UserTypes> = input extends TableFullConfigInput
  ? input["schema"]
  : input extends TableFullConfigInput<SchemaInput<userTypes>, userTypes>
  ? input["schema"]
  : input extends TableShorthandConfigInput<userTypes>
  ? inferSchema<resolveTableShorthandConfig<input, userTypes>, userTypes>
  : never;

export type validateTableConfig<input, userTypes = undefined> = userTypes extends UserTypes
  ? input extends TableShorthandConfigInput<userTypes>
    ? validateTableShorthandConfig<input, userTypes>
    : input extends TableFullConfigInput<userTypes>
    ? validateTableFullConfig<input, userTypes>
    : TableConfigInput<inferSchema<input, userTypes>, userTypes>
  : TableConfigInput;

type validateTableFullConfig<input extends TableFullConfigInput<userTypes>, userTypes extends UserTypes = UserTypes> = {
  [k in keyof input]: k extends "keys"
    ? validateKeys<input[k], getStaticAbiTypeKeys<input["schema"], userTypes>>
    : input[k];
};

type validateKeys<keys, validKey extends PropertyKey> = {
  [i in keyof keys]: keys[i] extends validKey ? keys[i] : validKey;
};

type resolveTableFullConfig<
  input extends TableFullConfigInput<SchemaInput<userTypes>, userTypes>,
  userTypes extends UserTypes
> = {
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

export type resolveTableConfig<
  input,
  userTypes extends UserTypes = UserTypes
> = input extends TableShorthandConfigInput<userTypes>
  ? resolveTableConfig<resolveTableShorthandConfig<input, userTypes>, userTypes>
  : input extends TableFullConfigInput<SchemaInput<userTypes>, userTypes>
  ? resolveTableFullConfig<input, userTypes>
  : never;

/**
 * If a shorthand table config is passed (just a schema or even just a single ABI type) we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input, userTypes extends UserTypes = UserTypes>(
  input: validateTableConfig<input, userTypes>,
  userTypes?: userTypes
): resolveTableConfig<input, userTypes> {
  // TODO: runtime implementation
  return {} as never;
}
