import { describe, it } from "vitest";
import { defineWorld } from "./world";
import { attest } from "@ark/attest";
import { World } from "./output";
import { satisfy } from "@ark/util";

describe("defineWorld", () => {
  it("should resolve namespaced tables", () => {
    const config = defineWorld({
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              schema: {
                id: "address",
                value: "uint256",
                dynamic: "string",
              },
              key: ["id"],
            },
          },
        },
      },
    });

    const expectedTable = {
      label: "ExampleTable",
      namespace: "ExampleNS" as string,
      name: "ExampleTable" as string,
      schema: {
        id: {
          type: "address",
          internalType: "address",
        },
        value: {
          type: "uint256",
          internalType: "uint256",
        },
        dynamic: {
          type: "string",
          internalType: "string",
        },
      },
      key: ["id"],
    } as const;

    attest<typeof expectedTable.label>(config.tables.ExampleNS__ExampleTable.label).equals(expectedTable.label);
    attest<typeof config.tables.ExampleNS__ExampleTable.label>(expectedTable.label);

    attest<typeof expectedTable.namespace>(config.tables.ExampleNS__ExampleTable.namespace).equals(
      expectedTable.namespace,
    );
    attest<typeof config.tables.ExampleNS__ExampleTable.namespace>(expectedTable.namespace);

    attest<typeof expectedTable.name>(config.tables.ExampleNS__ExampleTable.name).equals(expectedTable.name);
    attest<typeof config.tables.ExampleNS__ExampleTable.name>(expectedTable.name);

    attest<typeof expectedTable.schema>(config.tables.ExampleNS__ExampleTable.schema).equals(expectedTable.schema);
    attest<typeof config.tables.ExampleNS__ExampleTable.schema>(expectedTable.schema);

    attest<typeof expectedTable.key>(config.tables.ExampleNS__ExampleTable.key).equals(expectedTable.key);
    attest<typeof config.tables.ExampleNS__ExampleTable.key>(expectedTable.key);
  });

  it("should extend the output World type", () => {
    const config = defineWorld({
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              schema: {
                id: "Static",
                value: "MyEnum",
                dynamic: "Dynamic",
              },
              key: ["id"],
            },
          },
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" },
        Dynamic: { type: "string", filePath: "path/to/file" },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
    });

    attest<typeof config, satisfy<World, typeof config>>();
  });

  it("should only allow for single namespace or multiple namespaces, not both", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.
        namespaces: {},
        namespace: "app",
      }),
    )
      .throws("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.")
      .type.errors("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.");

    attest(() =>
      defineWorld({
        // @ts-expect-error Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.
        namespaces: {},
        tables: {},
      }),
    )
      .throws("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.")
      .type.errors("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.");

    attest(() =>
      defineWorld({
        // @ts-expect-error Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.
        namespaces: {},
        systems: {},
      }),
    )
      .throws("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.")
      .type.errors("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.");
  });

  it("should return a fully resolved config for a single namespace", () => {
    const config = defineWorld({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    });

    attest(config).snap({
      multipleNamespaces: false,
      namespace: "",
      namespaces: {
        "": {
          label: "",
          namespace: "",
          tables: {
            Example: {
              label: "Example",
              type: "table",
              namespaceLabel: "",
              namespace: "",
              name: "Example",
              tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000",
              schema: {
                id: { type: "address", internalType: "address" },
                name: { type: "string", internalType: "string" },
                age: { type: "uint256", internalType: "uint256" },
              },
              key: ["age"],
              codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
              deploy: { disabled: false },
            },
          },
          systems: {},
        },
      },
      tables: {
        Example: {
          label: "Example",
          type: "table",
          namespaceLabel: "",
          namespace: "",
          name: "Example",
          tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000",
          schema: {
            id: { type: "address", internalType: "address" },
            name: { type: "string", internalType: "string" },
            age: { type: "uint256", internalType: "uint256" },
          },
          key: ["age"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
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
        worldInterfaceName: "IWorld",
        worldgenDirectory: "world",
        worldImportPath: "@latticexyz/world/src",
      },
      systems: {},
      excludeSystems: [],
      deploy: {
        customWorldContract: "(undefined)",
        postDeployScript: "PostDeploy",
        deploysDirectory: "./deploys",
        worldsFile: "./worlds.json",
        upgradeableWorldImplementation: false,
      },
      modules: [],
    }).type.toString.snap(`{
  readonly namespace: string
  readonly tables: {
    readonly Example: {
      readonly label: "Example"
      readonly type: "table"
      readonly namespaceLabel: ""
      readonly namespace: string
      readonly name: string
      readonly tableId: \`0x\${string}\`
      readonly schema: {
        readonly id: {
          readonly type: "address"
          readonly internalType: "address"
        }
        readonly name: {
          readonly type: "string"
          readonly internalType: "string"
        }
        readonly age: {
          readonly type: "uint256"
          readonly internalType: "uint256"
        }
      }
      readonly key: readonly ["age"]
      readonly codegen: {
        readonly outputDirectory: string
        readonly tableIdArgument: false
        readonly storeArgument: false
        readonly dataStruct: boolean
      }
      readonly deploy: { readonly disabled: false }
    }
  }
  readonly codegen: {
    readonly storeImportPath: "@latticexyz/store/src"
    readonly userTypesFilename: "common.sol"
    readonly outputDirectory: "codegen"
    readonly indexFilename: "index.sol"
  } & {
    readonly worldInterfaceName: "IWorld"
    readonly worldgenDirectory: "world"
    readonly worldImportPath: "@latticexyz/world/src"
  }
  readonly sourceDirectory: "src"
  readonly enums: {}
  readonly userTypes: {}
  readonly enumValues: {}
  readonly multipleNamespaces: false
  readonly namespaces: {
    readonly "": {
      readonly label: ""
      readonly namespace: string
      readonly tables: {
        readonly Example: {
          readonly label: "Example"
          readonly type: "table"
          readonly namespaceLabel: ""
          readonly namespace: string
          readonly name: string
          readonly tableId: \`0x\${string}\`
          readonly schema: {
            readonly id: {
              readonly type: "address"
              readonly internalType: "address"
            }
            readonly name: {
              readonly type: "string"
              readonly internalType: "string"
            }
            readonly age: {
              readonly type: "uint256"
              readonly internalType: "uint256"
            }
          }
          readonly key: readonly ["age"]
          readonly codegen: {
            readonly outputDirectory: string
            readonly tableIdArgument: false
            readonly storeArgument: false
            readonly dataStruct: boolean
          }
          readonly deploy: { readonly disabled: false }
        }
      }
      readonly systems: {}
    }
  }
  readonly systems: {}
  readonly excludeSystems: readonly []
  readonly modules: readonly []
  readonly deploy: {
    readonly customWorldContract: undefined
    readonly postDeployScript: "PostDeploy"
    readonly deploysDirectory: "./deploys"
    readonly worldsFile: "./worlds.json"
    readonly upgradeableWorldImplementation: false
  }
}`);
  });

  it("should return a fully resolved config for multiple namespaces", () => {
    const config = defineWorld({
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

    attest(config).snap({
      multipleNamespaces: true,
      namespace: null,
      namespaces: {
        root: {
          label: "root",
          namespace: "",
          tables: {
            Example: {
              label: "Example",
              type: "table",
              namespaceLabel: "root",
              namespace: "",
              name: "Example",
              tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000",
              schema: {
                id: { type: "address", internalType: "address" },
                name: { type: "string", internalType: "string" },
                age: { type: "uint256", internalType: "uint256" },
              },
              key: ["age"],
              codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
              deploy: { disabled: false },
            },
          },
          systems: {},
        },
      },
      tables: {
        root__Example: {
          label: "Example",
          type: "table",
          namespaceLabel: "root",
          namespace: "",
          name: "Example",
          tableId: "0x746200000000000000000000000000004578616d706c65000000000000000000",
          schema: {
            id: { type: "address", internalType: "address" },
            name: { type: "string", internalType: "string" },
            age: { type: "uint256", internalType: "uint256" },
          },
          key: ["age"],
          codegen: { outputDirectory: "tables", tableIdArgument: false, storeArgument: false, dataStruct: true },
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
        worldInterfaceName: "IWorld",
        worldgenDirectory: "world",
        worldImportPath: "@latticexyz/world/src",
      },
      systems: {},
      excludeSystems: [],
      deploy: {
        customWorldContract: "(undefined)",
        postDeployScript: "PostDeploy",
        deploysDirectory: "./deploys",
        worldsFile: "./worlds.json",
        upgradeableWorldImplementation: false,
      },
      modules: [],
    }).type.toString.snap(`{
  readonly namespace: null
  readonly tables: {
    readonly root__Example: {
      readonly label: "Example"
      readonly type: "table"
      readonly namespaceLabel: "root"
      readonly namespace: string
      readonly name: string
      readonly tableId: \`0x\${string}\`
      readonly schema: {
        readonly id: {
          readonly type: "address"
          readonly internalType: "address"
        }
        readonly name: {
          readonly type: "string"
          readonly internalType: "string"
        }
        readonly age: {
          readonly type: "uint256"
          readonly internalType: "uint256"
        }
      }
      readonly key: readonly ["age"]
      readonly codegen: {
        readonly outputDirectory: string
        readonly tableIdArgument: false
        readonly storeArgument: false
        readonly dataStruct: boolean
      }
      readonly deploy: { readonly disabled: false }
    }
  }
  readonly codegen: {
    readonly storeImportPath: "@latticexyz/store/src"
    readonly userTypesFilename: "common.sol"
    readonly outputDirectory: "codegen"
    readonly indexFilename: "index.sol"
  } & {
    readonly worldInterfaceName: "IWorld"
    readonly worldgenDirectory: "world"
    readonly worldImportPath: "@latticexyz/world/src"
  }
  readonly sourceDirectory: "src"
  readonly enums: {}
  readonly userTypes: {}
  readonly enumValues: {}
  readonly multipleNamespaces: true
  readonly namespaces: {
    readonly root: {
      readonly label: "root"
      readonly namespace: string
      readonly tables: {
        readonly Example: {
          readonly label: "Example"
          readonly type: "table"
          readonly namespaceLabel: "root"
          readonly namespace: string
          readonly name: string
          readonly tableId: \`0x\${string}\`
          readonly schema: {
            readonly id: {
              readonly type: "address"
              readonly internalType: "address"
            }
            readonly name: {
              readonly type: "string"
              readonly internalType: "string"
            }
            readonly age: {
              readonly type: "uint256"
              readonly internalType: "uint256"
            }
          }
          readonly key: readonly ["age"]
          readonly codegen: {
            readonly outputDirectory: string
            readonly tableIdArgument: false
            readonly storeArgument: false
            readonly dataStruct: boolean
          }
          readonly deploy: { readonly disabled: false }
        }
      }
      readonly systems: {}
    }
  }
  readonly systems: {}
  readonly excludeSystems: readonly []
  readonly modules: readonly []
  readonly deploy: {
    readonly customWorldContract: undefined
    readonly postDeployScript: "PostDeploy"
    readonly deploysDirectory: "./deploys"
    readonly worldsFile: "./worlds.json"
    readonly upgradeableWorldImplementation: false
  }
}`);
  });

  it("should use the root namespace as default namespace", () => {
    const config = defineWorld({});
    attest(config.namespace).equals("");
  });

  it("should use pipe through non-default namespaces", () => {
    const config = defineWorld({ namespace: "custom" });
    attest(config.namespace).equals("custom");
  });

  it("should use the custom name and namespace as table index", () => {
    const config = defineWorld({
      namespace: "CustomNS",
      tables: {
        Example: {
          schema: { id: "address" },
          key: ["id"],
        },
      },
    });

    attest<"CustomNS__Example", keyof typeof config.tables>();
  });

  it("should throw if table label/namespace is overridden in namespace context", () => {
    attest(() =>
      defineWorld({
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
      defineWorld({
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
      defineWorld({
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
      defineWorld({
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

  it("should expand systems config", () => {
    const config = defineWorld({
      namespace: "app",
      systems: {
        Example: {},
      },
    });

    attest(config.systems).snap({
      Example: {
        label: "Example",
        namespace: "app",
        name: "Example",
        systemId: "0x737961707000000000000000000000004578616d706c65000000000000000000",
        deploy: { disabled: false, registerWorldFunctions: true },
        openAccess: true,
        accessList: [],
      },
    }).type.toString.snap(`{
  readonly Example: {
    readonly label: "Example"
    readonly namespace: string
    readonly name: string
    readonly systemId: \`0x\${string}\`
    readonly openAccess: true
    readonly accessList: readonly []
    readonly deploy: {
      readonly disabled: false
      readonly registerWorldFunctions: true
    }
  }
}`);
  });

  it("should allow setting openAccess of a system to false", () => {
    const config = defineWorld({
      systems: {
        Example: {
          openAccess: false,
        },
      },
    });

    attest<false>(config.systems.Example.openAccess).equals(false);
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

    defineWorld(config);
  });

  it("should throw if config has unexpected key", () => {
    attest(() =>
      defineWorld({
        // @ts-expect-error Invalid config option
        invalidOption: "nope",
      }),
    ).type.errors("`invalidOption` is not a valid World config option.");
  });
});
