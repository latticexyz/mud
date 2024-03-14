import { describe, it } from "vitest";
import { resolveStoreConfig } from "./store";
import { Config } from "./output";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import { CODEGEN_DEFAULTS, TABLE_CODEGEN_DEFAULTS } from "./defaults";

describe("resolveStoreConfig", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = resolveStoreConfig({ tables: { Name: "address" } });
    const expected = {
      tables: {
        Name: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Name" }),
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
          primaryKey: ["key"],
          name: "Name",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should accept a user type as input and expand it", () => {
    const config = resolveStoreConfig({ tables: { Name: "CustomType" }, userTypes: { CustomType: "address" } });
    const expected = {
      tables: {
        Name: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Name" }),
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
          primaryKey: ["key"],
          name: "Name",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: { CustomType: "address" },
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
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
          primaryKey: ["key"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static custom type, it should use `key` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
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
          primaryKey: ["key"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
          Example: {
            name: "string",
            age: "uint256",
          },
        },
      }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    attest(() =>
      // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
      resolveStoreConfig({ tables: { Example: { key: "string", name: "string", age: "uint256" } } }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static user type as key field", () => {
    attest(() =>
      resolveStoreConfig({
        // @ts-expect-error Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.
        tables: { Example: { key: "dynamic", name: "string", age: "uint256" } },
        userTypes: { dynamic: "string", static: "address" },
      }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected a `key` field with a static ABI type or an explicit `primaryKey` option.",
    );
  });

  it("should return the full config given a full config with one key", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "address", name: "string", age: "uint256" },
          primaryKey: ["age"],
        },
      },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
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
          primaryKey: ["age"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should return the full config given a full config with one key and user types", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "dynamic", name: "string", age: "static" },
          primaryKey: ["age"],
        },
      },
      userTypes: { static: "address", dynamic: "string" },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            key: {
              type: "string",
              internalType: "dynamic",
            },
            name: {
              type: "string",
              internalType: "string",
            },
            age: {
              type: "address",
              internalType: "static",
            },
          },
          keySchema: {
            age: {
              type: "address",
              internalType: "static",
            },
          },
          valueSchema: {
            key: {
              type: "string",
              internalType: "dynamic",
            },
            name: {
              type: "string",
              internalType: "string",
            },
          },
          primaryKey: ["age"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: { static: "address", dynamic: "string" },
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  }),
    it("should return the full config given a full config with two primaryKey", () => {
      const config = resolveStoreConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "string", age: "uint256" },
            primaryKey: ["age", "key"],
          },
        },
      });
      const expected = {
        tables: {
          Example: {
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
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
            primaryKey: ["age", "key"],
            name: "Example",
            namespace: "",
            codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
            type: "table",
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        codegen: CODEGEN_DEFAULTS,
      } as const;

      attest<typeof expected>(config).equals(expected);
    });

  it("should resolve two tables in the config with different schemas", () => {
    const config = resolveStoreConfig({
      tables: {
        First: {
          schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
          primaryKey: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
          primaryKey: ["secondKey", "secondAge"],
        },
      },
    });
    const expected = {
      tables: {
        First: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "First" }),
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
          primaryKey: ["firstKey", "firstAge"],
          name: "First",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
        Second: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Second" }),
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
          primaryKey: ["secondKey", "secondAge"],
          name: "Second",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should resolve two tables in the config with different schemas and user types", () => {
    const config = resolveStoreConfig({
      tables: {
        First: {
          schema: { firstKey: "Static", firstName: "Dynamic", firstAge: "uint256" },
          primaryKey: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "Static", secondName: "Dynamic", secondAge: "uint256" },
          primaryKey: ["secondKey", "secondAge"],
        },
      },
      userTypes: { Static: "address", Dynamic: "string" },
    });
    const expected = {
      tables: {
        First: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "First" }),
          schema: {
            firstKey: {
              type: "address",
              internalType: "Static",
            },
            firstName: {
              type: "string",
              internalType: "Dynamic",
            },
            firstAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          keySchema: {
            firstKey: {
              type: "address",
              internalType: "Static",
            },
            firstAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          valueSchema: {
            firstName: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          primaryKey: ["firstKey", "firstAge"],
          name: "First",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
        Second: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Second" }),
          schema: {
            secondKey: {
              type: "address",
              internalType: "Static",
            },
            secondName: {
              type: "string",
              internalType: "Dynamic",
            },
            secondAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          keySchema: {
            secondKey: {
              type: "address",
              internalType: "Static",
            },
            secondAge: {
              type: "uint256",
              internalType: "uint256",
            },
          },
          valueSchema: {
            secondName: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          primaryKey: ["secondKey", "secondAge"],
          name: "Second",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: { Static: "address", Dynamic: "string" },
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should throw if referring to fields of different tables", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          First: {
            schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
            primaryKey: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
            // @ts-expect-error Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'
            primaryKey: ["firstKey", "secondAge"],
          },
        },
      }),
    )
      .throws('Invalid primary key. Expected `("secondKey" | "secondAge")[]`, received `["firstKey", "secondAge"]`')
      .type.errors(`Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'`);
  });

  it("should throw an error if the provided key is not a static field", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "string", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'.
            primaryKey: ["name"],
          },
        },
      }),
    )
      .throws('Invalid primary key. Expected `("key" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw an error if the provided key is not a static field with user types", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "Dynamic", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'.
            primaryKey: ["name"],
          },
        },
        userTypes: {
          Dynamic: "string",
        },
      }),
    )
      .throws('Invalid primary key. Expected `("key" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should return the full config given a full config with enums and user types", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { key: "dynamic", name: "ValidNames", age: "static" },
          primaryKey: ["name"],
        },
      },
      userTypes: { static: "address", dynamic: "string" },
      enums: {
        ValidNames: ["first", "second"],
      },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            key: {
              type: "string",
              internalType: "dynamic",
            },
            name: {
              type: "uint8",
              internalType: "ValidNames",
            },
            age: {
              type: "address",
              internalType: "static",
            },
          },
          keySchema: {
            name: {
              type: "uint8",
              internalType: "ValidNames",
            },
          },
          valueSchema: {
            age: {
              type: "address",
              internalType: "static",
            },
            key: {
              type: "string",
              internalType: "dynamic",
            },
          },
          primaryKey: ["name"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: { static: "address", dynamic: "string" },
      enums: {
        ValidNames: ["first", "second"],
      },
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should use the root namespace as default namespace", () => {
    const config = resolveStoreConfig({});

    attest<"">(config.namespace).equals("");
  });

  it("should use pipe through non-default namespaces", () => {
    const config = resolveStoreConfig({ namespace: "custom" });

    attest<"custom">(config.namespace).equals("custom");
  });

  it("should extend the output Config type", () => {
    const config = resolveStoreConfig({ tables: { Name: "CustomType" }, userTypes: { CustomType: "address" } });
    attest<true, typeof config extends Config ? true : false>();
  });
});
