import { describe, it } from "vitest";
import { resolveStoreConfig } from "./store";
import { attest } from "@arktype/attest";

describe("resolveStoreConfig", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = resolveStoreConfig({ tables: { Name: "address" } });
    attest<{
      tables: {
        Name: {
          schema: {
            key: {
              type: "bytes32";
              internalType: "bytes32";
            };
            value: {
              type: "address";
              internalType: "address";
            };
          };
          keySchema: {
            key: {
              type: "bytes32";
              internalType: "bytes32";
            };
          };
          valueSchema: {
            value: {
              type: "address";
              internalType: "address";
            };
          };
          keys: ["key"];
        };
      };
    }>(config);
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
    attest<{
      tables: {
        Example: {
          schema: {
            key: {
              type: "address";
              internalType: "address";
            };
            name: {
              type: "string";
              internalType: "string";
            };
            age: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keySchema: {
            key: {
              type: "address";
              internalType: "address";
            };
          };
          valueSchema: {
            name: {
              type: "string";
              internalType: "string";
            };
            age: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keys: ["key"];
        };
      };
    }>(config);
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    attest(
      resolveStoreConfig({
        tables: {
          // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
          Example: {
            name: "string",
            age: "uint256",
          },
        },
      })
    ).type.errors("Provide a `key` field with static ABI type or a full config with explicit keys override.");
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveStoreConfig({ tables: { Example: { key: "string", name: "string", age: "uint256" } } })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
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
    attest<{
      tables: {
        Example: {
          schema: {
            key: {
              type: "address";
              internalType: "address";
            };
            name: {
              type: "string";
              internalType: "string";
            };
            age: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keySchema: {
            age: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          valueSchema: {
            key: {
              type: "address";
              internalType: "address";
            };
            name: {
              type: "string";
              internalType: "string";
            };
          };
          keys: ["age"];
        };
      };
    }>(config);
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
    attest<{
      tables: {
        Example: {
          schema: {
            key: {
              type: "address";
              internalType: "address";
            };
            name: {
              type: "string";
              internalType: "string";
            };
            age: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keySchema: {
            age: {
              type: "uint256";
              internalType: "uint256";
            };
            key: {
              type: "address";
              internalType: "address";
            };
          };
          valueSchema: {
            name: {
              type: "string";
              internalType: "string";
            };
          };
          keys: ["age", "key"];
        };
      };
    }>(config);
  });

  it("should resolve two tables in the config with different schemas", () => {
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
    attest<{
      tables: {
        First: {
          schema: {
            firstKey: {
              type: "address";
              internalType: "address";
            };
            firstName: {
              type: "string";
              internalType: "string";
            };
            firstAge: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keySchema: {
            firstKey: {
              type: "address";
              internalType: "address";
            };
            firstAge: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          valueSchema: {
            firstName: {
              type: "string";
              internalType: "string";
            };
          };
          keys: ["firstKey", "firstAge"];
        };
        Second: {
          schema: {
            secondKey: {
              type: "address";
              internalType: "address";
            };
            secondName: {
              type: "string";
              internalType: "string";
            };
            secondAge: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          keySchema: {
            secondKey: {
              type: "address";
              internalType: "address";
            };
            secondAge: {
              type: "uint256";
              internalType: "uint256";
            };
          };
          valueSchema: {
            secondName: {
              type: "string";
              internalType: "string";
            };
          };
          keys: ["secondKey", "secondAge"];
        };
      };
    }>(config);
  });

  it("should throw if referring to fields of different tables", () => {
    attest(
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
      })
    ).type.errors(`Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'`);
  });

  it("should throw an error if the provided key is not a static field", () => {
    attest(
      resolveStoreConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "string", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'.
            keys: ["name"],
          },
        },
      })
    ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });
});
