import { ErrorMessage, conform, evaluate } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type";
import { get, keyof } from "./generics";
import { SchemaInput, isSchemaInput, resolveSchema } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";

export type NoStaticKeyFieldError =
  ErrorMessage<"Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.">;

export type ValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = readonly [
  getStaticAbiTypeKeys<schema, scope>,
  ...getStaticAbiTypeKeys<schema, scope>[],
];

export function isValidPrimaryKey<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  primaryKey: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): primaryKey is ValidKeys<schema, scope> {
  return (
    Array.isArray(primaryKey) &&
    primaryKey.every(
      (key) => keyof(key, schema) && keyof(schema[key], scope.types) && isStaticAbiType(scope.types[schema[key]]),
    )
  );
}

export type TableInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  primaryKey extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = TableFullInput<schema, scope, primaryKey> | TableShorthandInput<scope>;

export type TableShorthandInput<scope extends AbiTypeScope = AbiTypeScope> = SchemaInput<scope> | keyof scope["types"];

export type TableFullInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  primaryKey extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = {
  schema: schema;
  primaryKey: primaryKey;
};

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
export type validateTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> =
  input extends SchemaInput<scope>
    ? // If a shorthand schema is provided, require it to have a static key field
      "key" extends getStaticAbiTypeKeys<input, scope>
      ? input
      : NoStaticKeyFieldError
    : input extends keyof scope["types"]
      ? input
      : input extends string
        ? keyof scope["types"]
        : SchemaInput<scope>;

export function validateTableShorthand<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): asserts input is TableShorthandInput<scope> {
  if (typeof input === "string") {
    if (keyof(input, scope.types)) {
      return;
    }
    throw new Error(`Invalid ABI type. \`${input}\` not found in scope.`);
  }
  if (typeof input === "object" && input !== null) {
    if (isSchemaInput(input, scope)) {
      if (keyof("key", input) && isStaticAbiType(scope.types[input["key"]])) {
        return;
      }
      throw new Error(
        `Invalid schema. Expected a \`key\` field with a static ABI type or an explicit \`primaryKey\` option.`,
      );
    }
    throw new Error(`Invalid schema. Are you using invalid types or missing types in your scope?`);
  }
  throw new Error(`Invalid table shorthand.`);
}

export type resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> = input extends keyof scope["types"]
  ? evaluate<
      TableFullInput<
        { key: "bytes32"; value: input },
        scope,
        ["key" & getStaticAbiTypeKeys<{ key: "bytes32"; value: input }, scope>]
      >
    >
  : input extends SchemaInput<scope>
    ? "key" extends getStaticAbiTypeKeys<input, scope>
      ? // If the shorthand includes a static field called `key`, use it as key
        evaluate<TableFullInput<input, scope, ["key"]>>
      : never
    : never;

export function isTableShorthandInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is TableShorthandInput<scope> {
  return (typeof input === "string" && keyof(input, scope.types)) || isSchemaInput(input, scope);
}

export function resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableShorthand<input, scope>,
  scope: scope = AbiTypeScope as scope,
): resolveTableShorthand<input, scope> {
  validateTableShorthand(input, scope);

  if (isSchemaInput(input, scope)) {
    return {
      schema: input,
      primaryKey: ["key"],
    } as resolveTableShorthand<input, scope>;
  }

  return {
    schema: {
      key: "bytes32",
      value: input,
    },
    primaryKey: ["key"],
  } as resolveTableShorthand<input, scope>;
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export function validateKeys<validKeys extends PropertyKey, keys = PropertyKey[]>(keys: validateKeys<validKeys, keys>) {
  throw new Error("validateKeys not implemented");
}

export type validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: key extends "primaryKey"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput<scope>>, scope>, input[key]>
    : key extends "schema"
      ? conform<input[key], SchemaInput<scope>>
      : input[key];
};

export function validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as scope,
) {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected full table config, got ${JSON.stringify(input)}`);
  }

  if (!keyof("schema", input) || !isSchemaInput(input["schema"], scope)) {
    throw new Error("Invalid schema input");
  }

  if (!keyof("primaryKey", input) || !isValidPrimaryKey(input["primaryKey"], input["schema"], scope)) {
    throw new Error("Invalid primary key");
  }
}

export type validateTableConfig<input, scope extends AbiTypeScope = AbiTypeScope> =
  input extends TableShorthandInput<scope>
    ? validateTableShorthand<input, scope>
    : input extends string
      ? validateTableShorthand<input, scope>
      : validateTableFull<input, scope>;

export type resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
> = evaluate<{
  readonly primaryKey: Readonly<input["primaryKey"]>;
  readonly schema: resolveSchema<input["schema"], scope>;
  readonly keySchema: resolveSchema<
    {
      readonly [key in input["primaryKey"][number]]: input["schema"][key];
    },
    scope
  >;
  readonly valueSchema: resolveSchema<
    {
      readonly [key in Exclude<keyof input["schema"], input["primaryKey"][number]>]: input["schema"][key];
    },
    scope
  >;
}>;

export function isTableFullInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is TableFullInput<SchemaInput<scope>, scope> {
  return (
    typeof input === "object" &&
    input !== null &&
    keyof("schema", input) &&
    isSchemaInput(input["schema"], scope) &&
    keyof("primaryKey", input) &&
    isValidPrimaryKey(input["primaryKey"], input["schema"], scope)
  );
}

export function resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
>(input: input, scope: scope = AbiTypeScope as scope): resolveTableFullConfig<input, scope> {
  validateTableFull(input, scope);

  return {
    primaryKey: input["primaryKey"],
    schema: resolveSchema(input["schema"], scope),
    keySchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input["schema"]).filter(([key]) =>
          input["primaryKey"].includes(key as input["primaryKey"][number]),
        ),
      ),
      scope,
    ),
    valueSchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input["schema"]).filter(
          ([key]) => !input["primaryKey"].includes(key as input["primaryKey"][number]),
        ),
      ),
      scope,
    ),
  } as resolveTableFullConfig<input, scope>;
}

export type resolveTableConfig<input, scope extends AbiTypeScope = AbiTypeScope> = evaluate<
  input extends TableShorthandInput<scope>
    ? resolveTableFullConfig<resolveTableShorthand<input, scope>, scope>
    : input extends TableFullInput<SchemaInput<scope>, scope>
      ? resolveTableFullConfig<input, scope>
      : input
>;

/**
 * If a shorthand table config is passed we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableConfig<input, scope>,
  scope: scope = AbiTypeScope as scope,
): resolveTableConfig<input, scope> {
  if (isTableShorthandInput(input, scope)) {
    const fullInput = resolveTableShorthand(input as validateTableShorthand<input, scope>, scope);
    if (isTableFullInput(fullInput, scope)) {
      return resolveTableFullConfig(fullInput, scope) as unknown as resolveTableConfig<input, scope>;
    }
    throw new Error("Resolved shorthand is not a valid full table input");
  }

  if (isTableFullInput(input, scope)) {
    return resolveTableFullConfig(input, scope) as unknown as resolveTableConfig<input, scope>;
  }

  throw new Error("Invalid config input");
}
