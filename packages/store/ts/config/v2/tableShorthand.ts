import { ErrorMessage, evaluate } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type";
import { hasOwnKey } from "./generics";
import { SchemaInput, isSchemaInput } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";
import { TableFullInput } from "./tableFull";

export type NoStaticKeyFieldError =
  ErrorMessage<"Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.">;

export type TableShorthandInput<scope extends AbiTypeScope = AbiTypeScope> = SchemaInput<scope> | keyof scope["types"];

export function isTableShorthandInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is TableShorthandInput<scope> {
  return typeof input === "string" || isSchemaInput(input, scope);
}

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
export type validateTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> =
  input extends SchemaInput<scope>
    ? // If a shorthand schema is provided, require it to have a static `id` field
      "id" extends getStaticAbiTypeKeys<input, scope>
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
    if (hasOwnKey(scope.types, input)) {
      return;
    }
    throw new Error(`Invalid ABI type. \`${input}\` not found in scope.`);
  }
  if (typeof input === "object" && input !== null) {
    if (isSchemaInput(input, scope)) {
      if (hasOwnKey(input, "id") && isStaticAbiType(scope.types[input["id"]])) {
        return;
      }
      throw new Error(`Invalid schema. Expected an \`id\` field with a static ABI type or an explicit \`key\` option.`);
    }
    throw new Error(`Invalid schema. Are you using invalid types or missing types in your scope?`);
  }
  throw new Error(`Invalid table shorthand.`);
}

export type resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope> = input extends keyof scope["types"]
  ? evaluate<
      TableFullInput<
        { id: "bytes32"; value: input },
        scope,
        ["id" & getStaticAbiTypeKeys<{ id: "bytes32"; value: input }, scope>]
      >
    >
  : input extends SchemaInput<scope>
    ? "id" extends getStaticAbiTypeKeys<input, scope>
      ? // If the shorthand includes a static field called `id`, use it as `key`
        evaluate<TableFullInput<input, scope, ["id"]>>
      : never
    : never;

export function resolveTableShorthand<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateTableShorthand<input, scope>,
  scope: scope = AbiTypeScope as scope,
): resolveTableShorthand<input, scope> {
  validateTableShorthand(input, scope);

  if (isSchemaInput(input, scope)) {
    return {
      schema: input,
      key: ["id"],
    } as resolveTableShorthand<input, scope>;
  }

  return {
    schema: {
      id: "bytes32",
      value: input,
    },
    key: ["id"],
  } as resolveTableShorthand<input, scope>;
}
