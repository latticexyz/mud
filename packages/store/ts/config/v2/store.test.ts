import { describe, it } from "vitest";
import { defineStore } from "./store";
import { attest } from "@ark/attest";
import { resourceToHex } from "@latticexyz/common";
import { Store } from "./output";
import { satisfy } from "@ark/util";
import { Hex } from "viem";

describe("defineStore", () => {
  it("should return a fully resolved config for a single namespace", () => {
    const config = defineStore({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    const expectedConfig = {
      multipleNamespaces: false,
      namespace: "" as string,
      namespaces: {
        "": {
          label: "",
          namespace: "" as string,
          tables: {
            Example: {
              label: "Example",
              type: "table",
              namespace: "" as string,
              name: "Example" as string,
              tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000" as Hex,
              schema: {
                id: { type: "address", internalType: "address" },
                name: { type: "string", internalType: "string" },
                age: { type: "uint256", internalType: "uint256" },
              },
              key: ["age"],
              codegen: {
                outputDirectory: "tables" as string,
                tableIdArgument: false,
                storeArgument: false,
                dataStruct: true as boolean,
              },
              deploy: { disabled: false },
            },
          },
        },
      },
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
          tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000" as Hex,
          schema: {
            id: { type: "address", internalType: "address" },
            name: { type: "string", internalType: "string" },
            age: { type: "uint256", internalType: "uint256" },
          },
          key: ["age"],
          codegen: {
            outputDirectory: "tables" as string,
            tableIdArgument: false,
            storeArgument: false,
            dataStruct: true as boolean,
          },
          deploy: { disabled: false },
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: {
        storeImportPath: "@latticexyz/store/src",
        userTypesFilename: "common.sol",
        outputDirectory: "codegen",
        indexFilename: "index.sol",
      },
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
    attest<typeof config>(expectedConfig);
  });

  it("should return a fully resolved config for multiple namespaces", () => {
    const config = defineStore({
      namespaces: {
        root: {
          namespace: "",
          tables: {
            Example: {
              schema: { id: "address", name: "string", age: "uint256" },
              key: ["age"],
            },
          },
        },
      },
    });

    const expectedConfig = {
      multipleNamespaces: true,
      namespace: null,
      namespaces: {
        root: {
          label: "root",
          namespace: "" as string,
          tables: {
            Example: {
              label: "Example",
              type: "table",
              namespace: "" as string,
              name: "Example" as string,
              tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000" as Hex,
              schema: {
                id: { type: "address", internalType: "address" },
                name: { type: "string", internalType: "string" },
                age: { type: "uint256", internalType: "uint256" },
              },
              key: ["age"],
              codegen: {
                outputDirectory: "tables" as string,
                tableIdArgument: false,
                storeArgument: false,
                dataStruct: true as boolean,
              },
              deploy: { disabled: false },
            },
          },
        },
      },
      tables: {
        root__Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
          tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000" as Hex,
          schema: {
            id: { type: "address", internalType: "address" },
            name: { type: "string", internalType: "string" },
            age: { type: "uint256", internalType: "uint256" },
          },
          key: ["age"],
          codegen: {
            outputDirectory: "tables" as string,
            tableIdArgument: false,
            storeArgument: false,
            dataStruct: true as boolean,
          },
          deploy: { disabled: false },
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: {
        storeImportPath: "@latticexyz/store/src",
        userTypesFilename: "common.sol",
        outputDirectory: "codegen",
        indexFilename: "index.sol",
      },
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
    attest<typeof config>(expectedConfig);
  });

  it("should only allow for single namespace or multiple namespaces, not both", () => {
    attest(() =>
      defineStore({
        // @ts-expect-error Cannot use `namespaces` with `namespace` or `tables` keys.
        namespaces: {},
        namespace: "app",
      }),
    )
      .throws("Cannot use `namespaces` with `namespace` or `tables` keys.")
      .type.errors("Cannot use `namespaces` with `namespace` or `tables` keys.");

    attest(() =>
      defineStore({
        // @ts-expect-error Cannot use `namespaces` with `namespace` or `tables` keys.
        namespaces: {},
        tables: {},
      }),
    )
      .throws("Cannot use `namespaces` with `namespace` or `tables` keys.")
      .type.errors("Cannot use `namespaces` with `namespace` or `tables` keys.");
  });

  // TODO: move to table tests
  it("should resolve schema with user types", () => {
    const config = defineStore({
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      tables: {
        Example: {
          schema: { id: "dynamic", name: "string", age: "static" },
          key: ["age"],
        },
      },
    });

    const expectedSchema = {
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
    } as const;

    attest<typeof expectedSchema>(config.tables.Example.schema).equals(expectedSchema);
    attest<typeof config.tables.Example.schema>(expectedSchema);
  });

  // TODO: move to table tests
  it("should resolve a table with a composite key", () => {
    const config = defineStore({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age", "id"],
        },
      },
    });

    const expectedKey = ["age", "id"] as const;

    attest<typeof expectedKey>(config.tables.Example.key).equals(expectedKey);
    attest<typeof config.tables.Example.key>(expectedKey);
  });

  // TODO: move to table tests
  it("should resolve two tables with different schemas", () => {
    const config = defineStore({
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

    const expectedFirstSchema = {
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
    } as const;

    const expectedSecondSchema = {
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
    } as const;

    attest<typeof expectedFirstSchema>(config.tables.First.schema).equals(expectedFirstSchema);
    attest<typeof config.tables.First.schema>(expectedFirstSchema);

    attest<typeof expectedSecondSchema>(config.tables.Second.schema).equals(expectedSecondSchema);
    attest<typeof config.tables.Second.schema>(expectedSecondSchema);
  });

  // TODO: move to table tests
  it("should resolve two tables with different schemas and user types", () => {
    const config = defineStore({
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
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
    });

    const expectedFirstSchema = {
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
    } as const;

    const expectedSecondSchema = {
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
    } as const;

    attest<typeof expectedFirstSchema>(config.tables.First.schema).equals(expectedFirstSchema);
    attest<typeof config.tables.First.schema>(expectedFirstSchema);

    attest<typeof expectedSecondSchema>(config.tables.Second.schema).equals(expectedSecondSchema);
    attest<typeof config.tables.Second.schema>(expectedSecondSchema);
  });

  it("should throw if referring to fields of different tables", () => {
    attest(() =>
      defineStore({
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
      defineStore({
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
      defineStore({
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

  // TODO: move to table tests
  it("should resolve schema with enums and user types", () => {
    const config = defineStore({
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        ValidNames: ["first", "second"],
      },
      tables: {
        Example: {
          schema: { id: "dynamic", name: "ValidNames", age: "static" },
          key: ["name"],
        },
      },
    });

    const expectedSchema = {
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
    } as const;

    attest<typeof expectedSchema>(config.tables.Example.schema).equals(expectedSchema);
    attest<typeof config.tables.Example.schema>(expectedSchema);
  });

  it("should accept an empty input", () => {
    const config = defineStore({});
    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should satisfy the output type when using single namespace", () => {
    const config = defineStore({
      tables: { Name: { schema: { id: "address" }, key: ["id"] } },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });

    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should satisfy the output type when using multiple namespaces", () => {
    const config = defineStore({
      namespaces: {},
    });

    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should use the root namespace as default namespace", () => {
    const config = defineStore({});
    attest(config.namespace).equals("");
  });

  it("should use pipe through non-default namespace", () => {
    const config = defineStore({ namespace: "custom" });
    attest(config.namespace).equals("custom");
  });

  it("should use the base namespace for tables", () => {
    const config = defineStore({
      namespace: "namespace",
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    attest(config.namespace).equals("namespace");
    attest<"Example">(config.tables.namespace__Example.label).equals("Example");
    attest(config.tables.namespace__Example.namespace).equals("namespace");
    attest(config.tables.namespace__Example.name).equals("Example");
    attest(config.tables.namespace__Example.tableId).equals(
      resourceToHex({ type: "table", name: "Example", namespace: "namespace" }),
    );
  });

  it("should show a type error if an invalid schema is passed in", () => {
    // @ts-expect-error Key `invalidKey` does not exist in TableInput
    attest(() => defineStore({ tables: { Invalid: { invalidKey: 1 } } })).type.errors(
      "Key `invalidKey` does not exist in TableInput",
    );
  });

  it("should throw if table label/namespace is overridden in namespace context", () => {
    attest(() =>
      defineStore({
        namespace: "CustomNS",
        tables: {
          Example: {
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in this context"
            label: "NotAllowed",
            schema: { id: "address" },
            key: ["id"],
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in this context");

    attest(() =>
      defineStore({
        namespace: "CustomNS",
        tables: {
          Example: {
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in this context"
            namespace: "NotAllowed",
            schema: { id: "address" },
            key: ["id"],
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in this context");

    attest(() =>
      defineStore({
        namespaces: {
          CustomNS: {
            tables: {
              Example: {
                // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in this context"
                label: "NotAllowed",
                schema: { id: "address" },
                key: ["id"],
              },
            },
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in this context");

    attest(() =>
      defineStore({
        namespaces: {
          CustomNS: {
            tables: {
              Example: {
                // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in this context"
                namespace: "NotAllowed",
                schema: { id: "address" },
                key: ["id"],
              },
            },
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in this context");
  });

  it("should allow const enum as input", () => {
    const enums = {
      Example: ["First", "Second"],
    } as const;

    attest(defineStore({ enums }).enums).equals({
      Example: ["First", "Second"],
    });

    attest(defineStore({ enums }).enumValues).equals({
      Example: {
        First: 0,
        Second: 1,
      },
    });
  });

  it("should allow a const config as input", () => {
    const config = {
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    } as const;

    defineStore(config);
  });

  it("should throw if config has unexpected key", () => {
    attest(() =>
      defineStore({
        // @ts-expect-error Invalid config option
        invalidOption: "nope",
      }),
    ).type.errors("`invalidOption` is not a valid Store config option.");
  });

  describe("shorthands", () => {
    // TODO: move to table tests
    it("should accept a shorthand store config as input and expand it", () => {
      const config = defineStore({ tables: { Name: "address" } });

      const expectedTable = {
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
        key: ["id"],
      } as const;

      attest<typeof expectedTable.schema>(config.tables.Name.schema).equals(expectedTable.schema);
      attest<typeof config.tables.Name.schema>(expectedTable.schema);

      attest<typeof expectedTable.key>(config.tables.Name.key).equals(expectedTable.key);
      attest<typeof config.tables.Name.key>(expectedTable.key);
    });

    it("should satisfy the output type", () => {
      const config = defineStore({
        tables: { Name: { schema: { id: "address" }, key: ["id"] } },
        userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
      });

      attest<typeof config, satisfy<Store, typeof config>>();
    });

    it("should accept an empty input", () => {
      const config = defineStore({});
      attest<typeof config, satisfy<Store, typeof config>>();
    });

    it("should accept a user type as input and expand it", () => {
      const config = defineStore({
        tables: { Name: "CustomType" },
        userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
      });

      const expectedTable = {
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
        key: ["id"],
      } as const;

      attest<typeof expectedTable.schema>(config.tables.Name.schema).equals(expectedTable.schema);
      attest<typeof config.tables.Name.schema>(expectedTable.schema);

      attest<typeof expectedTable.key>(config.tables.Name.key).equals(expectedTable.key);
      attest<typeof config.tables.Name.key>(expectedTable.key);
    });

    it("given a schema with a key field with static ABI type, it should use `id` as single key", () => {
      const config = defineStore({
        tables: { Example: { id: "address", name: "string", age: "uint256" } },
      });

      const expectedTable = {
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
        key: ["id"],
      } as const;

      attest<typeof expectedTable.schema>(config.tables.Example.schema).equals(expectedTable.schema);
      attest<typeof config.tables.Example.schema>(expectedTable.schema);

      attest<typeof expectedTable.key>(config.tables.Example.key).equals(expectedTable.key);
      attest<typeof config.tables.Example.key>(expectedTable.key);
    });

    it("given a schema with a key field with static custom type, it should use `id` as single key", () => {
      const config = defineStore({
        tables: { Example: { id: "address", name: "string", age: "uint256" } },
      });

      const expectedTable = {
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
        key: ["id"],
      } as const;

      attest<typeof expectedTable.schema>(config.tables.Example.schema).equals(expectedTable.schema);
      attest<typeof config.tables.Example.schema>(expectedTable.schema);

      attest<typeof expectedTable.key>(config.tables.Example.key).equals(expectedTable.key);
      attest<typeof config.tables.Example.key>(expectedTable.key);
    });

    it("should throw if the shorthand doesn't include a key field", () => {
      attest(() =>
        defineStore({
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

    it("should throw if the shorthand config includes a non-static key field", () => {
      attest(() =>
        // @ts-expect-error Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.
        defineStore({ tables: { Example: { id: "string", name: "string", age: "uint256" } } }),
      ).throwsAndHasTypeError(
        "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
      );
    });

    it("should throw if the shorthand config includes a non-static user type as key field", () => {
      attest(() =>
        defineStore({
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

    it("should throw if the shorthand key is neither a custom nor ABI type", () => {
      // @ts-expect-error Type '"NotAnAbiType"' is not assignable to type 'AbiType'
      attest(() => defineStore({ tables: { Invalid: "NotAnAbiType" } }))
        .throws("Invalid ABI type. `NotAnAbiType` not found in scope.")
        .type.errors(`Type '"NotAnAbiType"' is not assignable to type 'AbiType'`);
    });
  });
});
