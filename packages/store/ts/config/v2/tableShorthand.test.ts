import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { AbiTypeScope, extendScope } from "./scope";
import { resolveTableShorthand } from "./tableShorthand";

describe("resolveTableShorthand", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthand("address");

    attest<{
      schema: {
        key: "bytes32";
        value: "address";
      };
      primaryKey: ["key"];
    }>(table)
      .snap({ schema: { key: "bytes32", value: "address" }, primaryKey: ["key"] })
      .type.toString.snap('{ schema: { key: "bytes32"; value: "address"; }; primaryKey: ["key"]; }');
  });

  it("should expand a single custom type into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand("CustomType", scope);

    attest<{
      schema: {
        key: "bytes32";
        value: "CustomType";
      };
      primaryKey: ["key"];
    }>(table)
      .snap({ schema: { key: "bytes32", value: "CustomType" }, primaryKey: ["key"] })
      .type.toString.snap('{ schema: { key: "bytes32"; value: "CustomType"; }; primaryKey: ["key"]; }');
  });

  it("should throw if the provided shorthand is not an ABI type and no user types are provided", () => {
    attest(() =>
      // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type AbiType'
      resolveTableShorthand("NotAnAbiType"),
    )
      .throws("Invalid ABI type. `NotAnAbiType` not found in scope.")
      .type.errors(`Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'.`);
  });

  it("should throw if the provided shorthand is not a user type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });

    attest(() =>
      // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type AbiType | "CustomType"
      resolveTableShorthand("NotACustomType", scope),
    )
      .throws("Invalid ABI type. `NotACustomType` not found in scope.")
      .type.errors(
        `Argument of type '"NotACustomType"' is not assignable to parameter of type 'AbiType | "CustomType"'.`,
      );
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthand({ key: "address", name: "string", age: "uint256" });

    attest<{
      schema: {
        key: "address";
        name: "string";
        age: "uint256";
      };
      primaryKey: ["key"];
    }>(table)
      .snap({ schema: { key: "address", name: "string", age: "uint256" }, primaryKey: ["key"] })
      .type.toString.snap('{ schema: { key: "address"; name: "string"; age: "uint256"; }; primaryKey: ["key"]; }');
  });

  it("should throw an error if the shorthand doesn't include a key field", () => {
    attest(() =>
      // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
      resolveTableShorthand({ name: "string", age: "uint256" }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    attest(() =>
      // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
      resolveTableShorthand({ key: "string", name: "string", age: "uint256" }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should throw an error if an invalid type is passed in", () => {
    attest(() =>
      // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
      resolveTableShorthand({ key: "uint256", name: "NotACustomType" }),
    )
      .throws("Invalid schema. Are you using invalid types or missing types in your scope?")
      .type.errors(`Type '"NotACustomType"' is not assignable to type 'AbiType'.`);
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope);

    attest<{
      schema: { key: "CustomType"; name: "string"; age: "uint256" };
      primaryKey: ["key"];
    }>(table)
      .snap({ schema: { key: "CustomType", name: "string", age: "uint256" }, primaryKey: ["key"] })
      .type.toString.snap('{ schema: { key: "CustomType"; name: "string"; age: "uint256"; }; primaryKey: ["key"]; }');
  });

  it("should throw an error if `key` is not a custom static type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    attest(() =>
      // @ts-expect-error "Error: Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option."
      resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope),
    )
      .throws("Invalid schema. Expected a `key` field with a static ABI type.")
      .type.errors(`Provide a \`key\` field with static ABI type or a full config with explicit \`primaryKey\`.`);
  });
});
