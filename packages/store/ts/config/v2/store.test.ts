import { describe, it, expectTypeOf } from "vitest";
import { resolveStoreConfig } from "./store";
import { attest } from "@arktype/attest";

describe("resolveStoreConfig", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = resolveStoreConfig({ tables: { Name: "address" } });
    const expected = {
      tables: {
        Name: {
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
        },
      },
    } as const;
    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
    const expected = {
      tables: {
        Example: {
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
        },
      },
    } as const;
    attest<typeof expected>(config).equals(expected);
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
    const expected = {
      tables: {
        Example: {
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
            age: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          valueSchema: {
            key: {
              type: "address",
              internalType: "address",
            },
            name: {
              type: "string",
              internalType: "string",
            },
          },
          keys: ["age"],
        },
      },
    } as const;
    attest<typeof expected>(config).equals(expected);
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
    const expected = {
      tables: {
        Example: {
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
            age: {
              type: "uint256",
              internalType: "uint256",
            },
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
          },
          keys: ["age", "key"],
        },
      },
    } as const;
    attest<typeof expected>(config).equals(expected);
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

    const expected = {
      tables: {
        First: {
          schema: {
            firstKey: {
              type: "address",
              internalType: "address",
            },
            firstName: {
              type: "string",
              internalType: "string",
            },
            firstAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          keySchema: {
            firstKey: {
              type: "address",
              internalType: "address",
            },
            firstAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          valueSchema: {
            firstName: {
              type: "string",
              internalType: "string",
            },
          },
          keys: ["firstKey", "firstAge"],
        },
        Second: {
          schema: {
            secondKey: {
              type: "address",
              internalType: "address",
            },
            secondName: {
              type: "string",
              internalType: "string",
            },
            secondAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          keySchema: {
            secondKey: {
              type: "address",
              internalType: "address",
            },
            secondAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          valueSchema: {
            secondName: {
              type: "string",
              internalType: "string",
            },
          },
          keys: ["secondKey", "secondAge"],
        },
      },
    };
    attest<typeof expected>(config).equals(expected);
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
