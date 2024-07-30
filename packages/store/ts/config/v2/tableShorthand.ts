import { FixedArrayAbiType, isFixedArrayAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";
import { hasOwnKey, isObject } from "./generics";
import { SchemaInput, ScopedSchemaInput, TableShorthandInput } from "./input";
import { isSchemaInput } from "./schema";
import { AbiTypeScope, Scope, getStaticAbiTypeKeys } from "./scope";
import { ErrorMessage, conform } from "@ark/util";

export const NoStaticKeyFieldError =
  "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.";

export type NoStaticKeyFieldError = ErrorMessage<typeof NoStaticKeyFieldError>;

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
  : // If a fixed array type or a valid type from the scope is provided, accept it
    input extends FixedArrayAbiType | keyof scope["types"]
    ? input
    : // If the input is not a valid shorthand, return the expected type
      input extends string
      ? keyof scope["types"]
      : ScopedSchemaInput<scope>;

export function validateTableShorthand<scope extends Scope = AbiTypeScope>(
  shorthand: unknown,
  scope: scope = AbiTypeScope as never,
): asserts shorthand is TableShorthandInput {
  if (typeof shorthand === "string") {
    if (isFixedArrayAbiType(shorthand) || hasOwnKey(scope.types, shorthand)) {
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

export type expandTableShorthand<shorthand> = shorthand extends string
  ? {
      readonly schema: {
        readonly id: "bytes32";
        readonly value: shorthand;
      };
      readonly key: ["id"];
    }
  : shorthand extends SchemaInput
    ? {
        readonly schema: shorthand;
        readonly key: ["id"];
      }
    : shorthand;

export function expandTableShorthand<shorthand, scope extends Scope = AbiTypeScope>(
  shorthand: shorthand,
  scope: scope,
): expandTableShorthand<shorthand> {
  if (typeof shorthand === "string") {
    return {
      schema: {
        id: "bytes32",
        value: shorthand,
      },
      key: ["id"],
    } as never;
  }

  if (isSchemaInput(shorthand, scope)) {
    return {
      schema: shorthand,
      key: ["id"],
    } as never;
  }

  return shorthand as never;
}

export function defineTableShorthand<input, scope extends Scope = AbiTypeScope>(
  input: validateTableShorthand<input, scope>,
  scope: scope = AbiTypeScope as unknown as scope,
): expandTableShorthand<input> {
  validateTableShorthand(input, scope);
  return expandTableShorthand(input, scope) as never;
}
