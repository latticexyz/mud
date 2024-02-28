import { describe, it, expectTypeOf } from "vitest";
import { resolveStoreConfig } from "./store";

describe("resolveStoreConfig", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = resolveStoreConfig({ tables: { Name: "address" } });
    const table = config.tables.Name;
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "bytes32"; value: "address" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ key: "bytes32" }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ value: "address" }>();
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
    const table = config.tables.Example;
    expectTypeOf<typeof table.schema>().toEqualTypeOf<{ key: "address"; name: "string"; age: "uint256" }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["key"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ key: "address" }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: "string"; age: "uint256" }>();
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    resolveStoreConfig({
      tables: {
        // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
        Example: {
          name: "string",
          age: "uint256",
        },
      },
    });
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    resolveStoreConfig({ tables: { Example: { key: "string", name: "string", age: "uint256" } } });
  });

  it("should return the full config given a full config with one key", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "address", name: "string", age: "uint256" },
          keys: ["age"],
        },
      },
    });
    const table = config.tables.Example;

    expectTypeOf<typeof table.schema>().toEqualTypeOf<{
      key: "address";
      name: "string";
      age: "uint256";
    }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["age"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ age: "uint256" }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ key: "address"; name: "string" }>();
  });

  it("it should return the full config given a full config with two keys", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "address", name: "string", age: "uint256" },
          keys: ["age", "key"],
        },
      },
    });
    const table = config.tables.Example;

    expectTypeOf<typeof table.schema>().toEqualTypeOf<{
      key: "address";
      name: "string";
      age: "uint256";
    }>();
    expectTypeOf<typeof table.keys>().toEqualTypeOf<["age", "key"]>();
    expectTypeOf<typeof table.keySchema>().toEqualTypeOf<{ age: "uint256"; key: "address" }>();
    expectTypeOf<typeof table.valueSchema>().toEqualTypeOf<{ name: "string" }>();
  });

  it("should work for two tables in the config with different schemas", () => {
    const config = resolveStoreConfig({
      tables: {
        First: {
          schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
          keys: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
          keys: ["secondKey", "secondAge"],
        },
      },
    });
    const firstTable = config.tables.First;
    const secondTable = config.tables.Second;

    expectTypeOf<typeof firstTable.schema>().toEqualTypeOf<{
      firstKey: "address";
      firstName: "string";
      firstAge: "uint256";
    }>();
    expectTypeOf<typeof firstTable.keys>().toEqualTypeOf<["firstKey", "firstAge"]>();
    expectTypeOf<typeof firstTable.keySchema>().toEqualTypeOf<{ firstAge: "uint256"; firstKey: "address" }>();
    expectTypeOf<typeof firstTable.valueSchema>().toEqualTypeOf<{ firstName: "string" }>();

    expectTypeOf<typeof secondTable.schema>().toEqualTypeOf<{
      secondKey: "address";
      secondName: "string";
      secondAge: "uint256";
    }>();
    expectTypeOf<typeof secondTable.keys>().toEqualTypeOf<["secondKey", "secondAge"]>();
    expectTypeOf<typeof secondTable.keySchema>().toEqualTypeOf<{ secondAge: "uint256"; secondKey: "address" }>();
    expectTypeOf<typeof secondTable.valueSchema>().toEqualTypeOf<{ secondName: "string" }>();
  });

  it("should throw if referring to fields of different tables", () => {
    resolveStoreConfig({
      tables: {
        First: {
          schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
          keys: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
          // @ts-expect-error Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'
          keys: ["firstKey", "secondAge"],
        },
      },
    });
  });

  it("should throw an error if the provided key is not a static field", () => {
    resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Keys must have static ABI types.
          keys: ["name"],
        },
      },
    });
  });
});
