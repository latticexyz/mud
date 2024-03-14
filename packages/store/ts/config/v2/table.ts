import { ErrorMessage, evaluate } from "@arktype/util";
import { SchemaInput } from "./schema";
import { AbiTypeScope } from "./scope";
import {
  TableShorthandInput,
  isTableShorthandInput,
  resolveTableShorthand,
  validateTableShorthand,
} from "./tableShorthand";
import {
  TableFullInput,
  ValidKeys,
  isTableFullInput,
  resolveTableFullConfig,
  validateTableFull,
  tableWithDefaults,
} from "./tableFull";
import { CONFIG_DEFAULTS } from "./defaults";

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

export function validateTableConfig<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is TableInput<SchemaInput<scope>, scope> {
  if (isTableShorthandInput(input, scope)) {
    return validateTableShorthand(input, scope);
  }
  validateTableFull(input, scope);
}

export type resolveTableConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope,
  defaultName extends string = "",
  defaultNamespace extends string = typeof CONFIG_DEFAULTS.namespace,
> = evaluate<
  input extends TableShorthandInput<scope>
    ? resolveTableFullConfig<
        tableWithDefaults<resolveTableShorthand<input, scope>, defaultName, defaultNamespace, scope>,
        scope
      >
    : input extends TableFullInput<SchemaInput<scope>, scope>
      ? resolveTableFullConfig<tableWithDefaults<input, defaultName, defaultNamespace, scope>, scope>
      : never
>;

/**
 * If a shorthand table config is passed we expand it with sane defaults:
 * - A single ABI type is turned into { schema: { key: "bytes32", value: INPUT }, key: ["key"] }.
 * - A schema with a `key` field with static ABI type is turned into { schema: INPUT, key: ["key"] }.
 * - A schema without a `key` field is invalid.
 */
export function resolveTableConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope,
  // TODO: temporary fix to have access to the default name here.
  // Will remove once there is a clearer separation between full config and shorthand config
  defaultName extends string = "",
  defaultNamespace extends string = typeof CONFIG_DEFAULTS.namespace,
>(
  input: validateTableConfig<input, scope>,
  scope: scope = AbiTypeScope as scope,
  defaultName?: defaultName,
  defaultNamespace?: defaultNamespace,
): resolveTableConfig<input, scope> {
  if (isTableShorthandInput(input, scope)) {
    const fullInput = resolveTableShorthand(input as validateTableShorthand<input, scope>, scope);
    if (isTableFullInput(fullInput)) {
      return resolveTableFullConfig(
        // @ts-expect-error TODO: the base input type should be more permissive and constraints added via the validate helpers instead
        tableWithDefaults(fullInput, defaultName, defaultNamespace),
        scope,
      ) as unknown as resolveTableConfig<input, scope>;
    }
    throw new Error("Resolved shorthand is not a valid full table input");
  }

  if (isTableFullInput(input)) {
    return resolveTableFullConfig(
      // @ts-expect-error TODO: the base input type should be more permissive and constraints added via the validate helpers instead
      tableWithDefaults(input, defaultName, defaultNamespace),
      scope,
    ) as unknown as resolveTableConfig<input, scope>;
  }

  throw new Error("Invalid config input");
}
