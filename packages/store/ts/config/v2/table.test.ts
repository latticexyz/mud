import { describe, it, expectTypeOf } from "vitest";
import { resolveTableConfig, resolveTableShorthandConfig } from "./table";

describe("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthandConfig("address");
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("should expand a single custom into a key/value schema", () => {
    const table = resolveTableShorthandConfig("CustomType");
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "bytes32"; value: "CustomType" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("should throw an error if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableShorthandConfig({ name: "string", age: "uint256" });
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableShorthandConfig({ key: "string", name: "string", age: "uint256" });
  });

  it("should throw an error if an invalid type is passed in", () => {
    resolveTableShorthandConfig({ key: "uint256", name: "NotACustomType" });
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const table = resolveTableShorthandConfig({ key: "CustomType", name: "string", age: "uint256" });
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "CustomType"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("should throw an error if `key` is not a custom static type", () => {
    resolveTableShorthandConfig({ key: "CustomType", name: "string", age: "uint256" });
  });
});

describe("resolveTableConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableConfig("address");
    expectTypeOf<keyof typeof table.schema>().toEqualTypeOf<"key" | "value">();
    expectTypeOf<typeof table.schema.key>().toEqualTypeOf<{ type: "bytes32"; internalType: "bytes32" }>();
    expectTypeOf<typeof table.schema.value>().toEqualTypeOf<{ type: "address"; internalType: "address" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
    expectTypeOf<keyof typeof table.keySchema>().toEqualTypeOf<"key">();
    expectTypeOf<typeof table.keySchema.key>().toEqualTypeOf<{ type: "bytes32"; internalType: "bytes32" }>();
    expectTypeOf<keyof typeof table.valueSchema>().toEqualTypeOf<"value">();
    expectTypeOf<typeof table.valueSchema.value>().toEqualTypeOf<{ type: "address"; internalType: "address" }>();
  });

  it.todo("should expand a single custom type into a key/value schema");

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
    expectTypeOf<keyof typeof table.schema>().toEqualTypeOf<"key" | "name" | "age">();
    expectTypeOf<typeof table.schema.key>().toEqualTypeOf<{ type: "address"; internalType: "address" }>();
    expectTypeOf<typeof table.schema.name>().toEqualTypeOf<{ type: "string"; internalType: "string" }>();
    expectTypeOf<typeof table.schema.age>().toEqualTypeOf<{ type: "uint256"; internalType: "uint256" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
    expectTypeOf<keyof typeof table.keySchema>().toEqualTypeOf<"key">();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ key: "address" }>();
    expectTypeOf<keyof typeof table.valueSchema>().toEqualTypeOf<"name" | "age">();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: "string"; age: "uint256" }>();
  });

  it.todo("should use `key` as single key if it has a static custom type");

  it("should throw if the shorthand key is a dynamic ABI type", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableConfig({ key: "string", name: "string", age: "uint256" });
  });

  it.todo("should throw if the shorthand key is a dyamic custom type");

  it.todo("should throw if the shorthand key is neither a custom nor ABI type");

  it("should throw if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableConfig({ name: "string", age: "uint256" });
  });

  it("should return the full config given a full config with one key", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      keys: ["age"],
    });

    expectTypeOf<typeof table.schema>().toEqualTypeOf<{
      key: { type: "address"; internalType: "address" };
      name: { type: "string"; internalType: "string" };
      age: { type: "uint256"; internalType: "uint256" };
    }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["age"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ age: { type: "uint256"; internalType: "uint256" } }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{
      key: { type: "address"; internalType: "address" };
      name: { type: "string"; internalType: "string" };
    }>();
  });

  it("should return the full config given a full config with two keys", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      keys: ["age", "key"],
    });

    expectTypeOf<typeof table.schema>().toEqualTypeOf<{
      key: { type: "address"; internalType: "address" };
      name: { type: "string"; internalType: "string" };
      age: { type: "uint256"; internalType: "uint256" };
    }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["age", "key"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{
      age: { type: "uint256"; internalType: "uint256" };
      key: { type: "address"; internalType: "address" };
    }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: { type: "string"; internalType: "string" } }>();
  });

  it.todo("should return the full config given a config with custom types as values");

  it.todo("should return the full config given a config with custom type as key");

  it("should throw if the provided key is a dynamic ABI type", () => {
    resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      // @ts-expect-error Keys must have static ABI types.
      keys: ["name"],
    });
  });

  it.todo("should throw if the provided key is a dynamic custom type");

  it.todo("should throw if the provided key is neither a custom nor ABI type");
});
