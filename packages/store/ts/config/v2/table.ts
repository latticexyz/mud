import { ErrorMessage, evaluate } from "@arktype/util";
import { SchemaInput, resolveSchema } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";

export type NoStaticKeyFieldError =
  ErrorMessage<"Provide a `key` field with static ABI type or a full config with explicit keys override.">;

export type ValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = [
  getStaticAbiTypeKeys<schema, scope>,
  ...getStaticAbiTypeKeys<schema, scope>[]
];

export type TableInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  keys extends ValidKeys<schema, scope> = ValidKeys<schema, scope>
> = TableFullInput<schema, scope, keys> | TableShorthandInput<scope>;

export type TableShorthandInput<scope extends AbiTypeScope = AbiTypeScope> =
  | SchemaInput<scope>
  | keyof scope["allTypes"];

export type TableFullInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  keys extends ValidKeys<schema, scope> = ValidKeys<schema, scope>
> = {
  schema: schema;
  keys: keys;
};

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
type validateTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> = input extends SchemaInput<scope>
  ? // If a shorthand schema is provided, require it to have a static key field
    "key" extends getStaticAbiTypeKeys<input, scope>
    ? input
    : NoStaticKeyFieldError
  : input extends keyof scope["allTypes"]
  ? input
  : input extends string
  ? keyof scope["allTypes"]
  : SchemaInput<scope>;

export type resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> = input extends SchemaInput<scope>
  ? "key" extends getStaticAbiTypeKeys<input, scope>
    ? // If the shorthand includes a static field called `key`, use it as key
      evaluate<TableFullInput<input, scope, ["key"]>>
    : never
  : input extends keyof scope["allTypes"]
  ? evaluate<
      TableFullInput<
        { key: "bytes32"; value: input },
        scope,
        ["key" & getStaticAbiTypeKeys<{ key: "bytes32"; value: input }, scope>]
      >
    >
  : never;

export function resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableShorthand<input, scope>,
  scope?: scope
): resolveTableShorthand<input, scope> {
  // TODO: runtime implementation
  return {} as never;
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export function validateKeys<validKeys extends PropertyKey, keys = PropertyKey[]>(
  keys: validateKeys<validKeys, keys>
): keys {
  // TODO: runtime implementation
  return {} as never;
}

type validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope> = input extends TableFullInput<
  SchemaInput<scope>,
  scope
>
  ? {
      keys: validateKeys<getStaticAbiTypeKeys<input["schema"], scope>, input["keys"]>;
      schema: input["schema"];
    }
  : input extends { keys: unknown; schema: SchemaInput }
  ? {
      keys: validateKeys<getStaticAbiTypeKeys<input["schema"], scope>, input["keys"]>;
      schema: SchemaInput<scope>;
    }
  : {
      keys: string[];
      schema: SchemaInput<scope>;
    };

export type validateTableConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope
> = input extends TableShorthandInput<scope>
  ? validateTableShorthand<input, scope>
  : input extends string
  ? validateTableShorthand<input, scope>
  : validateTableFull<input, scope>;

type resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope
> = evaluate<{
  keys: input["keys"];
  schema: resolveSchema<input["schema"], scope>;
  keySchema: resolveSchema<
    {
      [key in input["keys"][number]]: input["schema"][key];
    },
    scope
  >;
  valueSchema: resolveSchema<
    {
      [key in Exclude<keyof input["schema"], input["keys"][number]>]: input["schema"][key];
    },
    scope
  >;
}>;

export type resolveTableConfig<input, scope extends AbiTypeScope = AbiTypeScope> = evaluate<
  input extends TableShorthandInput<scope>
    ? resolveTableFullConfig<resolveTableShorthand<input, scope>, scope>
    : input extends TableFullInput<SchemaInput<scope>, scope>
    ? resolveTableFullConfig<input, scope>
    : never
>;

/**
 * If a shorthand table config is passed () we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableConfig<input, scope>,
  scope?: scope
): resolveTableConfig<input, scope> {
  // TODO: runtime implementation
  return {} as never;
}
