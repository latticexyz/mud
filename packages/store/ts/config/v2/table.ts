import { ErrorMessage, evaluate } from "@arktype/util";
import { SchemaInput } from "./schema";
import { AbiTypeScope } from "./scope";
import {
  TableShorthandInput,
  isTableShorthandInput,
  resolveTableShorthand,
  validateTableShorthand,
} from "./tableShorthand";
import { TableFullInput, ValidKeys, isTableFullInput, resolveTableFullConfig, validateTableFull } from "./tableFull";

export type NoStaticKeyFieldError =
  ErrorMessage<"Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.">;

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

export type resolveTableConfig<input, scope extends AbiTypeScope = AbiTypeScope> = evaluate<
  input extends TableShorthandInput<scope>
    ? resolveTableFullConfig<resolveTableShorthand<input, scope>, scope>
    : input extends TableFullInput<SchemaInput<scope>, scope>
      ? resolveTableFullConfig<input, scope>
      : never
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
      // @ts-expect-error TODO: the base input type should be more permissive and constraints added via the validate helpers instead
      return resolveTableFullConfig(fullInput, scope) as unknown as resolveTableConfig<input, scope>;
    }
    throw new Error("Resolved shorthand is not a valid full table input");
  }

  if (isTableFullInput(input)) {
    // @ts-expect-error TODO: the base input type should be more permissive and constraints added via the validate helpers instead
    return resolveTableFullConfig(input, scope) as unknown as resolveTableConfig<input, scope>;
  }

  throw new Error("Invalid config input");
}

// TODO(alvrs): swap with a better fully resolved type
export type ResolvedTableConfig = resolveTableConfig<TableFullInput>;
