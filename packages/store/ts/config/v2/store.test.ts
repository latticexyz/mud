import { describe, it } from "vitest";
import { defineStore } from "./store";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import { CODEGEN_DEFAULTS, TABLE_CODEGEN_DEFAULTS, TABLE_DEPLOY_DEFAULTS } from "./defaults";
import { Store } from "./output";
import { satisfy } from "@arktype/util";

describe("defineStore", () => {
  it("should return the full config given a full config with one key", () => {
    const config = defineStore({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
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
          key: ["age"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("should return the full config given a full config with one key and user types", () => {
    const config = defineStore({
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

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
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
          key: ["age"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("should return the full config given a full config with two key", () => {
    const config = defineStore({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age", "id"],
        },
      },
    });

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
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
          key: ["age", "id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("should resolve two tables in the config with different schemas", () => {
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

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        First: {
          label: "First",
          type: "table",
          namespace: "" as string,
          name: "First" as string,
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
          key: ["firstKey", "firstAge"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
        Second: {
          label: "Second",
          type: "table",
          namespace: "" as string,
          name: "Second" as string,
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
          key: ["secondKey", "secondAge"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("should resolve two tables in the config with different schemas and user types", () => {
    const config = defineStore({
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

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        First: {
          label: "First",
          type: "table",
          namespace: "" as string,
          name: "First" as string,
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
          key: ["firstKey", "firstAge"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
        Second: {
          label: "Second",
          type: "table",
          namespace: "" as string,
          name: "Second" as string,
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
          key: ["secondKey", "secondAge"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
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

  it("should return the full config given a full config with enums and user types", () => {
    const config = defineStore({
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

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespace: "" as string,
          name: "Example" as string,
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
          key: ["name"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: {
        static: { type: "address", filePath: "path/to/file" },
        dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        ValidNames: ["first", "second"],
      },
      enumValues: {
        ValidNames: {
          first: 0,
          second: 1,
        },
      },
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("should use the root namespace as default namespace", () => {
    const config = defineStore({});

    attest<string>(config.namespace).equals("");
  });

  it("should use pipe through non-default namespace", () => {
    const config = defineStore({ namespace: "custom" });

    attest<string>(config.namespace).equals("custom");
  });

  it("should satisfy the output type", () => {
    const config = defineStore({
      tables: { Name: { schema: { id: "address" }, key: ["id"] } },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });

    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should use the global namespace instead for tables", () => {
    const config = defineStore({
      namespace: "namespace",
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    attest<string>(config.namespace).equals("namespace");
    attest<"Example">(config.tables.namespace__Example.label).equals("Example");
    attest<string>(config.tables.namespace__Example.namespace).equals("namespace");
    attest<string>(config.tables.namespace__Example.name).equals("Example");
    attest(config.tables.namespace__Example.tableId).equals(
      resourceToHex({ type: "table", name: "Example", namespace: "namespace" }),
    );
  });

  it("should throw if a string is passed in as schema", () => {
    // @ts-expect-error Invalid table config
    attest(() => defineStore({ tables: { Invalid: "uint256" } }))
      .throws('Expected full table config, got `"uint256"`')
      .type.errors("Expected full table config");
  });

  it("should show a type error if an invalid schema is passed in", () => {
    // @ts-expect-error Key `invalidKey` does not exist in TableInput
    attest(() => defineStore({ tables: { Invalid: { invalidKey: 1 } } })).type.errors(
      "Key `invalidKey` does not exist in TableInput",
    );
  });

  it("should throw if label is overridden in the store context", () => {
    attest(() =>
      defineStore({
        namespace: "CustomNS",
        tables: {
          Example: {
            schema: { id: "address" },
            key: ["id"],
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in a store config"
            label: "NotAllowed",
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
  });

  it("should throw if namespace is overridden in the store context", () => {
    attest(() =>
      defineStore({
        namespace: "CustomNS",
        tables: {
          Example: {
            schema: { id: "address" },
            key: ["id"],
            // @ts-expect-error "Overrides of `label` and `namespace` are not allowed for tables in a store config"
            namespace: "NotAllowed",
          },
        },
      }),
    ).throwsAndHasTypeError("Overrides of `label` and `namespace` are not allowed for tables in a store config");
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

  it("should namespace output directories for tables", () => {
    const config = defineStore({
      namespace: "app",
      codegen: {
        namespaceDirectories: true,
      },
      tables: {
        NamespaceDir: {
          schema: { name: "string" },
          key: [],
        },
        NotNamespaceDir: {
          schema: { name: "string" },
          key: [],
          codegen: {
            outputDirectory: "tables",
          },
        },
      },
    });

    const expectedConfig = {
      namespace: "app" as string,
      tables: {
        app__NamespaceDir: {
          label: "NamespaceDir",
          type: "table",
          namespace: "app" as string,
          name: "NamespaceDir" as string,
          tableId: resourceToHex({ type: "table", namespace: "app", name: "NamespaceDir" }),
          schema: {
            name: {
              type: "string",
              internalType: "string",
            },
          },
          key: [],
          codegen: {
            ...TABLE_CODEGEN_DEFAULTS,
            dataStruct: false as boolean,
            outputDirectory: "app/tables" as string,
          },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
        app__NotNamespaceDir: {
          label: "NotNamespaceDir",
          type: "table",
          namespace: "app" as string,
          name: "NotNamespaceDir" as string,
          tableId: resourceToHex({ type: "table", namespace: "app", name: "NotNamespaceDir" }),
          schema: {
            name: {
              type: "string",
              internalType: "string",
            },
          },
          key: [],
          codegen: {
            ...TABLE_CODEGEN_DEFAULTS,
            dataStruct: false as boolean,
            outputDirectory: "tables",
          },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      namespaces: {
        app: {
          label: "app",
          namespace: "app" as string,
          tables: {
            NamespaceDir: {
              label: "NamespaceDir",
              type: "table",
              namespace: "app" as string,
              name: "NamespaceDir" as string,
              tableId: resourceToHex({ type: "table", namespace: "app", name: "NamespaceDir" }),
              schema: {
                name: {
                  type: "string",
                  internalType: "string",
                },
              },
              key: [],
              codegen: {
                ...TABLE_CODEGEN_DEFAULTS,
                dataStruct: false as boolean,
                outputDirectory: "app/tables" as string,
              },
              deploy: TABLE_DEPLOY_DEFAULTS,
            },
            NotNamespaceDir: {
              label: "NotNamespaceDir",
              type: "table",
              namespace: "app" as string,
              name: "NotNamespaceDir" as string,
              tableId: resourceToHex({ type: "table", namespace: "app", name: "NotNamespaceDir" }),
              schema: {
                name: {
                  type: "string",
                  internalType: "string",
                },
              },
              key: [],
              codegen: {
                ...TABLE_CODEGEN_DEFAULTS,
                dataStruct: false as boolean,
                outputDirectory: "tables",
              },
              deploy: TABLE_DEPLOY_DEFAULTS,
            },
          },
        },
      },
      sourceDirectory: "src",
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: {
        ...CODEGEN_DEFAULTS,
        namespaceDirectories: true,
      },
    } as const;

    // Running attest on the whole object is hard to parse when it fails, so test the inner objects first
    attest<typeof expectedConfig.codegen>(config.codegen).equals(expectedConfig.codegen);
    attest<typeof expectedConfig.tables.app__NamespaceDir.codegen>(config.tables.app__NamespaceDir.codegen).equals(
      expectedConfig.tables.app__NamespaceDir.codegen,
    );
    attest<typeof expectedConfig.tables.app__NotNamespaceDir.codegen>(
      config.tables.app__NotNamespaceDir.codegen,
    ).equals(expectedConfig.tables.app__NotNamespaceDir.codegen);

    attest(config.tables.app__NamespaceDir).equals(config.namespaces.app.tables.NamespaceDir);
    attest(config.tables.app__NotNamespaceDir).equals(config.namespaces.app.tables.NotNamespaceDir);

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });
});
