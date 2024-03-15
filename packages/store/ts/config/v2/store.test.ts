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
            id: {
              type: "bytes32",
              internalType: "bytes32",
            },
            value: {
              type: "address",
              internalType: "address",
            },
          },
          keySchema: {
            id: {
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
          key: ["id"],
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
    const config = resolveStoreConfig({
      tables: { Name: "CustomType" },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });
    const expected = {
      tables: {
        Name: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Name" }),
          schema: {
            id: {
              type: "bytes32",
              internalType: "bytes32",
            },
            value: {
              type: "address",
              internalType: "CustomType",
            },
          },
          keySchema: {
            id: {
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
          key: ["id"],
          name: "Name",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static ABI type, it should use `id` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { id: "address", name: "string", age: "uint256" } } });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            id: {
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
            id: {
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
          key: ["id"],
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

  it("given a schema with a key field with static custom type, it should use `id` as single key", () => {
    const config = resolveStoreConfig({ tables: { Example: { id: "address", name: "string", age: "uint256" } } });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            id: {
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
            id: {
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
          key: ["id"],
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
          // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
          Example: {
            name: "string",
            age: "uint256",
          },
        },
      }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static key field", () => {
    attest(() =>
      // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
      resolveStoreConfig({ tables: { Example: { id: "string", name: "string", age: "uint256" } } }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static user type as key field", () => {
    attest(() =>
      resolveStoreConfig({
        // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
        tables: { Example: { id: "dynamic", name: "string", age: "uint256" } },
        userTypes: {
          dynamic: { type: "string", filePath: "path/to/file" },
          static: { type: "address", filePath: "path/to/file" },
        },
      }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("should return the full config given a full config with one key", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            id: {
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
            id: {
              type: "address",
              internalType: "address",
            },
            name: {
              type: "string",
              internalType: "string",
            },
          },
          key: ["age"],
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
          schema: { id: "dynamic", name: "string", age: "static" },
          key: ["age"],
        },
      },
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            id: {
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
            id: {
              type: "string",
              internalType: "dynamic",
            },
            name: {
              type: "string",
              internalType: "string",
            },
          },
          key: ["age"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {},
      namespace: "",
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expected>(config).equals(expected);
  }),
    it("should return the full config given a full config with two key", () => {
      const config = resolveStoreConfig({
        tables: {
          Example: {
            schema: { id: "address", name: "string", age: "uint256" },
            key: ["age", "id"],
          },
        },
      });
      const expected = {
        tables: {
          Example: {
            tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
            schema: {
              id: {
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
              id: {
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
            key: ["age", "id"],
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
          key: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
          key: ["secondKey", "secondAge"],
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
          key: ["firstKey", "firstAge"],
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
          key: ["secondKey", "secondAge"],
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
          key: ["firstKey", "firstAge"],
        },
        Second: {
          schema: { secondKey: "Static", secondName: "Dynamic", secondAge: "uint256" },
          key: ["secondKey", "secondAge"],
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
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
          key: ["firstKey", "firstAge"],
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
          key: ["secondKey", "secondAge"],
          name: "Second",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
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
            key: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
            // @ts-expect-error Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'
            key: ["firstKey", "secondAge"],
          },
        },
      }),
    )
      .throws('Invalid key. Expected `("secondKey" | "secondAge")[]`, received `["firstKey", "secondAge"]`')
      .type.errors(`Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'`);
  });

  it("should throw an error if the provided key is not a static field", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          Example: {
            schema: { id: "address", name: "string", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'.
            key: ["name"],
          },
        },
      }),
    )
      .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
  });

  it("should throw an error if the provided key is not a static field with user types", () => {
    attest(() =>
      resolveStoreConfig({
        tables: {
          Example: {
            schema: { id: "address", name: "Dynamic", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"id" | "age"'.
            key: ["name"],
          },
        },
        userTypes: {
          Dynamic: { type: "string", filePath: "path/to/file" },
        },
      }),
    )
      .throws('Invalid key. Expected `("id" | "age")[]`, received `["name"]`')
      .type.errors(`Type '"name"' is not assignable to type '"id" | "age"'`);
  });

  it("should return the full config given a full config with enums and user types", () => {
    const config = resolveStoreConfig({
      tables: {
        Example: {
          schema: { id: "dynamic", name: "ValidNames", age: "static" },
          key: ["name"],
        },
      },
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        ValidNames: ["first", "second"],
      },
    });
    const expected = {
      tables: {
        Example: {
          tableId: resourceToHex({ type: "table", namespace: "", name: "Example" }),
          schema: {
            id: {
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
            id: {
              type: "string",
              internalType: "dynamic",
            },
          },
          key: ["name"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
        },
      },
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
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
    const config = resolveStoreConfig({
      tables: { Name: "CustomType" },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });
    attest<true, typeof config extends Config ? true : false>();
  });

  it("should use the global namespace instead for tables", () => {
    const config = resolveStoreConfig({
      namespace: "namespace",
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    attest<"namespace">(config.namespace).equals("namespace");
    attest<"namespace">(config.tables.Example.namespace).equals("namespace");
    attest(config.tables.Example.tableId).equals(
      resourceToHex({ type: "table", name: "Example", namespace: "namespace" }),
    );
  });
});
