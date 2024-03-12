import { ErrorMessage, evaluate } from "@arktype/util";
import { SchemaInput, resolveSchema } from "./schema";
import { AbiTypeScope } from "./scope";
import {
  TableShorthandInput,
  isTableShorthandInput,
  resolveTableShorthand,
  validateTableShorthand,
} from "./tableShorthand";
import { TableFullInput, ValidKeys, isTableFullInput, validateTableFull } from "./tableFull";

export type NoStaticKeyFieldError =
  ErrorMessage<"Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.">;

// TODO: make this type way more permissive and instead enforce the restrictions on the validation helpers
export type TableInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  primaryKey extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = TableFullInput<schema, scope, primaryKey> | TableShorthandInput<scope>;

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
    if (isTableFullInput(fullInput)) {
      // @ts-expect-error TODO: remove restrictions from TableInput type to resolve this error
      return resolveTableFullConfig(fullInput, scope) as unknown as resolveTableConfig<input, scope>;
    }
    throw new Error("Resolved shorthand is not a valid full table input");
  }

  if (isTableFullInput(input)) {
    // @ts-expect-error TODO: remove restrictions from TableInput type to resolve this error
    return resolveTableFullConfig(input, scope) as unknown as resolveTableConfig<input, scope>;
  }

  throw new Error("Invalid config input");
}
