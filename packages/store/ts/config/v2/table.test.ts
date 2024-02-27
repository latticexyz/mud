import { afterAll, beforeAll, describe, it, expectTypeOf } from "vitest";
import { resolveTableConfig, resolveTableShorthandConfig } from "./table";
import { setup, cleanup } from "@arktype/attest";

// TODO: translate into attest tests
describe("resolveTableConfig", () => {
  beforeAll(() => {
    setup();
  });

  afterAll(() => {
    cleanup();
  });
});

describe("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const config = resolveTableShorthandConfig("address");
    expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
    expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
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
      const config = resolveTableConfig("address");
      expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
      expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
      expectTypeOf<typeof config.keySchema>().toEqualTypeOf<{ key: "bytes32" }>();
      expectTypeOf<typeof config.valueSchema>().toEqualTypeOf<{ value: "address" }>();
    });

    it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
      const config = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
      expectTypeOf<typeof config.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
      expectTypeOf<typeof config.keys>().toEqualTypeOf<["key"]>();
      expectTypeOf<typeof config.keySchema>().toEqualTypeOf<{ key: "address" }>();
      expectTypeOf<typeof config.valueSchema>().toEqualTypeOf<{ name: "string"; age: "uint256" }>();
    });

    it("it should return the full config given a full config", () => {
      const configWithOneKey = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age"],
      });

      expectTypeOf<typeof configWithOneKey.schema>().toEqualTypeOf<{
        key: "address";
        name: "string";
        age: "uint256";
      }>();
      expectTypeOf<typeof configWithOneKey.keys>().toEqualTypeOf<["age"]>();
      expectTypeOf<typeof configWithOneKey.keySchema>().toEqualTypeOf<{ age: "uint256" }>();
      expectTypeOf<typeof configWithOneKey.valueSchema>().toEqualTypeOf<{ key: "address"; name: "string" }>();

      const configWithTwoKeys = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age", "key"],
      });

      expectTypeOf<typeof configWithTwoKeys.schema>().toEqualTypeOf<{
        key: "address";
        name: "string";
        age: "uint256";
      }>();
      expectTypeOf<typeof configWithTwoKeys.keys>().toEqualTypeOf<["age", "key"]>();
      expectTypeOf<typeof configWithTwoKeys.keySchema>().toEqualTypeOf<{ age: "uint256"; key: "address" }>();
      expectTypeOf<typeof configWithTwoKeys.valueSchema>().toEqualTypeOf<{ name: "string" }>();
    });

    it("should throw an error if the provided key is not a static field", () => {
      resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        // @ts-expect-error Keys must have static ABI types.
        keys: ["name"],
      });
    });

    it("throw an error if the shorthand doesn't include a key field", () => {
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
      resolveTableConfig({ name: "string", age: "uint256" });
    });

    it("throw an error if the shorthand config includes a non-static key field", () => {
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
      resolveTableConfig({ key: "string", name: "string", age: "uint256" });
    });
  });
});
