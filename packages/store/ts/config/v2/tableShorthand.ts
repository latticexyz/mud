import { ErrorMessage, conform } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type/internal";
import { hasOwnKey, isObject } from "./generics";
import { isSchemaInput } from "./schema";
import { AbiTypeScope, Scope, getStaticAbiTypeKeys } from "./scope";
import { SchemaInput, ScopedSchemaInput } from "./input";
import { TableShorthandInput } from "./shorthand/input";

export type NoStaticKeyFieldError =
  ErrorMessage<"Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.">;

export function isTableShorthandInput(shorthand: unknown): shorthand is TableShorthandInput {
  return (
    typeof shorthand === "string" ||
    (isObject(shorthand) && Object.values(shorthand).every((value) => typeof value === "string"))
  );
}

// We don't use `conform` here because the restrictions we're imposing here are not native to typescript
export type validateTableShorthand<input, scope extends Scope = AbiTypeScope> = input extends SchemaInput
  ? // If a shorthand schema is provided, require it to have a static `id` field
    "id" extends getStaticAbiTypeKeys<input, scope>
    ? // Require all values to be valid types in this scope
      conform<input, ScopedSchemaInput<scope>>
    : NoStaticKeyFieldError
  : // If a valid type from the scope is provided, accept it
    input extends keyof scope["types"]
    ? input
    : // If the input is not a valid shorthand, return the expected type
      input extends string
      ? keyof scope["types"]
      : ScopedSchemaInput<scope>;

export function validateTableShorthand<scope extends Scope = AbiTypeScope>(
  shorthand: unknown,
  scope: scope = AbiTypeScope as unknown as scope,
): asserts shorthand is TableShorthandInput {
  if (typeof shorthand === "string") {
    if (hasOwnKey(scope.types, shorthand)) {
      return;
    }
    throw new Error(`Invalid ABI type. \`${shorthand}\` not found in scope.`);
  }
  if (typeof shorthand === "object" && shorthand !== null) {
    if (isSchemaInput(shorthand, scope)) {
      if (hasOwnKey(shorthand, "id") && isStaticAbiType(scope.types[shorthand.id as keyof typeof scope.types])) {
        return;
      }
      throw new Error(`Invalid schema. Expected an \`id\` field with a static ABI type or an explicit \`key\` option.`);
    }
    throw new Error(`Invalid schema. Are you using invalid types or missing types in your scope?`);
  }
  throw new Error(`Invalid table shorthand.`);
}

export type resolveTableShorthand<
  shorthand,
  scope extends Scope = AbiTypeScope,
> = shorthand extends keyof scope["types"]
  ? { schema: { id: "bytes32"; value: shorthand }; key: ["id"] }
  : shorthand extends SchemaInput
    ? "id" extends getStaticAbiTypeKeys<shorthand, scope>
      ? // If the shorthand includes a static field called `id`, use it as `key`
        { schema: shorthand; key: ["id"] }
      : never
    : never;

export function resolveTableShorthand<shorthand, scope extends Scope = AbiTypeScope>(
  shorthand: validateTableShorthand<shorthand, scope>,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTableShorthand<shorthand, scope> {
  validateTableShorthand(shorthand, scope);

  if (isSchemaInput(shorthand, scope)) {
    return {
      schema: shorthand,
      key: ["id"],
    } as unknown as resolveTableShorthand<shorthand, scope>;
  }

  return {
    schema: {
      id: "bytes32",
      value: shorthand,
    },
    key: ["id"],
  } as unknown as resolveTableShorthand<shorthand, scope>;
}
