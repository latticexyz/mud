import { describe, it, expectTypeOf } from "vitest";
import { attest } from "@arktype/attest";
import { resolveTableConfig, resolveTableShorthandConfig } from "./table";

describe("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthandConfig("address");
    const expected = {
      schema: {
        key: "bytes32",
        value: "address",
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should expand a single custom into a key/value schema", () => {
    const table = resolveTableShorthandConfig("CustomType", { CustomType: "uint256" });
    const expected = {
      schema: {
        key: "bytes32",
        value: "CustomType",
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should throw if the provided shorthand is not an ABI type and no user types are provided", () => {
    // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'TableShorthandConfigInput<UserTypes>'
    attest(resolveTableShorthandConfig("NotAnAbiType")).type.errors(
      `"NotAnAbiType"' is not assignable to parameter of type 'TableShorthandConfigInput<UserTypes>`
    );
  });

  it("should throw if the provided shorthand is not a user type", () => {
    // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type 'TableShorthandConfigInput<{ CustomType: "uint256"; }>'
    attest(resolveTableShorthandConfig("NotACustomType", { CustomType: "uint256" })).type.errors(
      `"NotACustomType"' is not assignable to parameter of type 'TableShorthandConfigInput<{ CustomType: "uint256"; }>`
    );
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    const expected = {
      schema: {
        key: "address",
        name: "string",
        age: "uint256",
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should throw an error if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableShorthandConfig({ name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableShorthandConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if an invalid type is passed in", () => {
    // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
    attest(resolveTableShorthandConfig({ key: "uint256", name: "NotACustomType" })).type.errors(
      `Type '"NotACustomType"' is not assignable to type 'AbiType'.`
    );
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const table = resolveTableShorthandConfig(
      { key: "CustomType", name: "string", age: "uint256" },
      { CustomType: "uint256" }
    );
    const expected = {
      schema: { key: "CustomType", name: "string", age: "uint256" },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should throw an error if `key` is not a custom static type", () => {
    attest(
      // @ts-expect-error "Error: Provide a `key` field with static ABI type or a full config with explicit keys override."
      resolveTableShorthandConfig({ key: "CustomType", name: "string", age: "uint256" }, { CustomType: "bytes" })
    ).type.errors(`Provide a \`key\` field with static ABI type or a full config with explicit keys override.`);
  });
});

describe("resolveTableConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableConfig("address");
    const expected = {
      schema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
        value: {
          type: "address",
          internalType: "address",
        },
      },
      keySchema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
      },
      valueSchema: {
        value: {
          type: "address",
          internalType: "address",
        },
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should expand a single custom type into a key/value schema", () => {
    const table = resolveTableConfig("CustomType", { CustomType: "address" });
    const expected = {
      schema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
        value: {
          type: "address",
          internalType: "CustomType",
        },
      },
      keySchema: {
        key: {
          type: "bytes32",
          internalType: "bytes32",
        },
      },
      valueSchema: {
        value: {
          type: "address",
          internalType: "CustomType",
        },
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
    const expected = {
      schema: {
        key: {
          type: "address",
          internalType: "address",
        },
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keySchema: {
        key: {
          type: "address",
          internalType: "address",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keys: ["key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const table = resolveTableConfig({ key: "CustomType", name: "string", age: "uint256" }, { CustomType: "uint256" });
    const expected = {
      schema: {
        key: {
          type: "uint256",
          internalType: "CustomType",
        },
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keySchema: {
        key: {
          type: "uint256",
          internalType: "CustomType",
        },
      },
      valueSchema: {
        name: {
          type: "string",
          internalType: "string",
        },
        age: {
          type: "uint256",
          internalType: "uint256",
        },
      },
      keys: ["key"],
    };
    attest<typeof expected>(table).equals(expected);
  });

  it("should throw if the shorthand key is a dynamic ABI type", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override"
    );
  });

  it.todo("should throw if the shorthand key is a dyamic custom type");

  it.todo("should throw if the shorthand key is neither a custom nor ABI type");

  it("should throw if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableConfig({ name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should return the full config given a full config with one key", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      keys: ["age"],
    });
    const expected = {
      schema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
      },
      valueSchema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
      },
      keys: ["age"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it("should return the full config given a full config with two keys", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      keys: ["age", "key"],
    });
    const expected = {
      schema: {
        key: { type: "address", internalType: "address" },
        name: { type: "string", internalType: "string" },
        age: { type: "uint256", internalType: "uint256" },
      },
      keySchema: {
        age: { type: "uint256", internalType: "uint256" },
        key: { type: "address", internalType: "address" },
      },
      valueSchema: {
        name: { type: "string", internalType: "string" },
      },
      keys: ["age", "key"],
    } as const;
    attest<typeof expected>(table).equals(expected);
  });

  it.todo("should return the full config given a config with custom types as values");

  it.todo("should return the full config given a config with custom type as key");

  it("should throw if the provided key is a dynamic ABI type", () => {
    attest(
      resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        // @ts-expect-error Keys must have static ABI types.
        keys: ["name"],
      })
    ).type.errors(`Keys must have static ABI types.`);
  });

  it.todo("should throw if the provided key is a dynamic custom type");

  it.todo("should throw if the provided key is neither a custom nor ABI type");
});
