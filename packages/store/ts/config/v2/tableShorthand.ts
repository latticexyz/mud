import { evaluate } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type";
import { keyof } from "./generics";
import { SchemaInput, isSchemaInput } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";
import { NoStaticKeyFieldError } from "./table";
import { TableFullInput } from "./tableFull";

export type TableShorthandInput<scope extends AbiTypeScope = AbiTypeScope> = SchemaInput<scope> | keyof scope["types"];

export function isTableShorthandInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is TableShorthandInput<scope> {
  return (typeof input === "string" && keyof(input, scope.types)) || isSchemaInput(input, scope);
}

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
