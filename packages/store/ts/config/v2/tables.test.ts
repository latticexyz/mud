import { describe, it } from "vitest";
import { attest } from "@ark/attest";
import { AbiTypeScope, extendScope } from "./scope";
import { defineTables, validateTables } from "./tables";

describe("validateTables", () => {
  it("should validate shorthands", () => {
    attest(() => validateTables({ Short: "uint256" }, AbiTypeScope));
    attest(() => validateTables({ ShortSchema: { first: "uint256", second: "bool" } }, AbiTypeScope));
  });

  it("should reject invalid shorthand", () => {
    // TODO: type errors too?
    attest(() => validateTables({ Short: "nonexistent" }, AbiTypeScope)).throws(
      "Invalid ABI type. `nonexistent` not found in scope.",
    );
    attest(() => validateTables({ ShortSchema: { first: "nonexistent", second: "bool" } }, AbiTypeScope)).throws(
      "Invalid schema. Are you using invalid types or missing types in your scope?",
    );
  });
});

describe("defineTables", () => {
  it("expands shorthand table schemas", () => {
    const tables = defineTables(
      {
        Short: "uint256",
        ShortSchema: { id: "uint256", exists: "bool" },
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
          id: { type: "uint256", internalType: "uint256" },
          exists: { type: "bool", internalType: "bool" },
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

  it("should expand a single custom type into a id/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const tables = defineTables({ Custom: "CustomType" }, scope);

    const expectedTables = {
      Custom: {
        schema: {
          id: { type: "bytes32", internalType: "bytes32" },
          value: { type: "uint256", internalType: "CustomType" },
        },
        key: ["id"],
      },
    } as const;

    attest<typeof expectedTables.Custom.schema>(tables.Custom.schema).equals(expectedTables.Custom.schema);
    attest<typeof expectedTables.Custom.key>(tables.Custom.key).equals(expectedTables.Custom.key);
  });
});
