import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { AbiTypeScope } from "./scope";
import { resolveTables, validateTables } from "./tables";

describe("validateTables", () => {
  it("should validate shorthands", () => {
    attest(() => validateTables({ Short: "uint256" }, AbiTypeScope));
    attest(() => validateTables({ ShortSchema: { first: "uint256", second: "bool" } }, AbiTypeScope));
  });

  it.skip("should reject invalid shorthand", () => {
    attest(() => validateTables({ Short: "nonexistent" }, AbiTypeScope))
      .throws("Invalid ABI type. `nonexistent` not found in scope.")
      .type.errors("Invalid ABI type. `nonexistent` not found in scope.");
    attest(() => validateTables({ ShortSchema: { first: "nonexistent", second: "bool" } }, AbiTypeScope))
      .throws("Invalid ABI type. `nonexistent` not found in scope.")
      .type.errors("Invalid ABI type. `nonexistent` not found in scope.");
  });
});

describe("resolveTables", () => {
  it("expands shorthand table schemas", () => {
    const tables = resolveTables(
      {
        Short: "uint256",
        ShortSchema: { first: "uint256", second: "bool" },
      },
      AbiTypeScope,
    );

    const expectedTables = {
      Short: {
        schema: {
          id: { type: "bytes32", internalType: "bytes32" },
          value: { type: "uint256", internalType: "uint256" },
        },
        key: ["id"],
      },
      ShortSchema: {
        schema: {
          id: { type: "bytes32", internalType: "bytes32" },
          first: { type: "uint256", internalType: "uint256" },
          second: { type: "bool", internalType: "bool" },
        },
        key: ["id"],
      },
    } as const;

    attest<typeof expectedTables.Short.schema>(tables.Short.schema).equals(expectedTables.Short.schema);
    attest<typeof expectedTables.Short.key>(tables.Short.key).equals(expectedTables.Short.key);

    attest<typeof expectedTables.ShortSchema.schema>(tables.ShortSchema.schema).equals(
      expectedTables.ShortSchema.schema,
    );
    attest<typeof expectedTables.ShortSchema.key>(tables.ShortSchema.key).equals(expectedTables.ShortSchema.key);
  });

  // it("should expand a single custom type into a id/value schema", () => {
  //   const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
  //   const table = defineTableShorthand("CustomType", scope);

  //   attest<{
  //     schema: {
  //       id: "bytes32";
  //       value: "CustomType";
  //     };
  //     key: ["id"];
  //   }>(table).equals({
  //     schema: {
  //       id: "bytes32",
  //       value: "CustomType",
  //     },
  //     key: ["id"],
  //   });
  // });

  // it("should throw if the provided shorthand is not an ABI type and no user types are provided", () => {
  //   attest(() =>
  //     // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type AbiType'
  //     defineTableShorthand("NotAnAbiType"),
  //   )
  //     .throws("Invalid ABI type. `NotAnAbiType` not found in scope.")
  //     .type.errors(`Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'.`);
  // });

  // it("should throw if the provided shorthand is not a user type", () => {
  //   const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });

  //   attest(() =>
  //     // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type AbiType | "CustomType"
  //     defineTableShorthand("NotACustomType", scope),
  //   )
  //     .throws("Invalid ABI type. `NotACustomType` not found in scope.")
  //     .type.errors(
  //       `Argument of type '"NotACustomType"' is not assignable to parameter of type 'AbiType | "CustomType"'.`,
  //     );
  // });

  // it("should use `id` as single key if it has a static ABI type", () => {
  //   const table = defineTableShorthand({ id: "address", name: "string", age: "uint256" });

  //   attest<{
  //     schema: {
  //       id: "address";
  //       name: "string";
  //       age: "uint256";
  //     };
  //     key: ["id"];
  //   }>(table).equals({
  //     schema: {
  //       id: "address",
  //       name: "string",
  //       age: "uint256",
  //     },
  //     key: ["id"],
  //   });
  // });

  // it("should throw an error if the shorthand doesn't include an `id` field", () => {
  //   attest(() =>
  //     // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
  //     defineTableShorthand({ name: "string", age: "uint256" }),
  //   ).throwsAndHasTypeError(
  //     "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
  //   );
  // });

  // it("should throw an error if the shorthand config includes a non-static `id` field", () => {
  //   attest(() =>
  //     // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
  //     defineTableShorthand({ id: "string", name: "string", age: "uint256" }),
  //   ).throwsAndHasTypeError(
  //     "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
  //   );
  // });

  // it("should throw an error if an invalid type is passed in", () => {
  //   attest(() =>
  //     // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
  //     defineTableShorthand({ id: "uint256", name: "NotACustomType" }),
  //   )
  //     .throws("Invalid schema. Are you using invalid types or missing types in your scope?")
  //     .type.errors(`Type '"NotACustomType"' is not assignable to type 'AbiType'.`);
  // });

  // it("should use `id` as single key if it has a static custom type", () => {
  //   const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
  //   const table = defineTableShorthand({ id: "CustomType", name: "string", age: "uint256" }, scope);

  //   attest<{
  //     schema: { id: "CustomType"; name: "string"; age: "uint256" };
  //     key: ["id"];
  //   }>(table).equals({
  //     schema: { id: "CustomType", name: "string", age: "uint256" },
  //     key: ["id"],
  //   });
  // });

  // it("should throw an error if `id` is not a custom static type", () => {
  //   const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
  //   attest(() =>
  //     // @ts-expect-error "Error: Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option."
  //     defineTableShorthand({ id: "CustomType", name: "string", age: "uint256" }, scope),
  //   ).throwsAndHasTypeError(NoStaticKeyFieldError);
  // });
});
