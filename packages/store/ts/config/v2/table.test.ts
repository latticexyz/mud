import { describe, it, expectTypeOf } from "vitest";
import { resolveTableConfig, resolveTableShorthandConfig } from "./table";

describe("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthandConfig("address");
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const table = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableShorthandConfig({ name: "string", age: "uint256" });
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveTableShorthandConfig({ key: "string", name: "string", age: "uint256" });
  });

  describe("resolveTableConfig", () => {
    it("should expand a single ABI type into a key/value schema", () => {
      const table = resolveTableConfig("address");
      expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
      expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
      expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ key: "bytes32" }>();
      expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ value: "address" }>();
    });

    it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
      const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
      expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
      expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
      expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ key: "address" }>();
      expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: "string"; age: "uint256" }>();
    });

    it("should return the full config given a full config with one key", () => {
      const table = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age"],
      });

      expectTypeOf<typeof table.schema>().toEqualTypeOf<{
        key: "address";
        name: "string";
        age: "uint256";
      }>();
      expectTypeOf<typeof table.keys>().toEqualTypeOf<["age"]>();
      expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ age: "uint256" }>();
      expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ key: "address"; name: "string" }>();
    });

    it("should return the full config given a full config with one key", () => {
      const table = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age", "key"],
      });

      expectTypeOf<typeof table.schema>().toEqualTypeOf<{
        key: "address";
        name: "string";
        age: "uint256";
      }>();
      expectTypeOf<typeof table.keys>().toEqualTypeOf<["age", "key"]>();
      expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ age: "uint256"; key: "address" }>();
      expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: "string" }>();
    });

    it("should throw an error if the provided key is not a static field", () => {
      resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        // @ts-expect-error Keys must have static ABI types.
        keys: ["name"],
      });
    });
  });
});
