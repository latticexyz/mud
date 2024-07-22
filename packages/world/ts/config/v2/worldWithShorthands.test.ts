import { describe, it } from "vitest";
import { defineWorldWithShorthands } from "./worldWithShorthands";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import {
  CONFIG_DEFAULTS as STORE_CONFIG_DEFAULTS,
  TABLE_CODEGEN_DEFAULTS,
  CODEGEN_DEFAULTS as STORE_CODEGEN_DEFAULTS,
  TABLE_DEPLOY_DEFAULTS,
} from "@latticexyz/store/config/v2";
import { CODEGEN_DEFAULTS as WORLD_CODEGEN_DEFAULTS, CONFIG_DEFAULTS as WORLD_CONFIG_DEFAULTS } from "./defaults";

const CONFIG_DEFAULTS = { ...STORE_CONFIG_DEFAULTS, ...WORLD_CONFIG_DEFAULTS };
const CODEGEN_DEFAULTS = { ...STORE_CODEGEN_DEFAULTS, ...WORLD_CODEGEN_DEFAULTS };

describe("defineWorldWithShorthands", () => {
  it.skip("should resolve namespaced shorthand table config with user types and enums", () => {
    const config = defineWorldWithShorthands({
      // @ts-expect-error TODO
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: "Static",
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

    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
      tables: {
        ExampleNS__ExampleTable: {
          label: "ExampleTable",
          type: "table",
          namespace: "ExampleNS",
          name: "ExampleTable" as string,
          tableId: resourceToHex({ type: "table", namespace: "ExampleNS", name: "ExampleTable" }),
          schema: {
            id: {
              type: "bytes32",
              internalType: "bytes32",
            },
            value: {
              type: "address",
              internalType: "Static",
            },
          },
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" as string },
        Dynamic: { type: "string", filePath: "path/to/file" as string },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
      enumValues: {
        MyEnum: {
          First: 0,
          Second: 1,
        },
      },
      namespace: "" as string,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it.skip("should resolve namespaced shorthand schema table config with user types and enums", () => {
    const config = defineWorldWithShorthands({
      // @ts-expect-error TODO
      namespaces: {
        ExampleNS: {
          tables: {
            ExampleTable: {
              id: "Static",
              value: "MyEnum",
              dynamic: "Dynamic",
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

    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
      tables: {
        ExampleNS__ExampleTable: {
          label: "ExampleTable",
          type: "table",
          namespace: "ExampleNS",
          name: "ExampleTable" as string,
          tableId: resourceToHex({ type: "table", namespace: "ExampleNS", name: "ExampleTable" }),
          schema: {
            id: {
              type: "address",
              internalType: "Static",
            },
            value: {
              type: "uint8",
              internalType: "MyEnum",
            },
            dynamic: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {
        Static: { type: "address", filePath: "path/to/file" as string },
        Dynamic: { type: "string", filePath: "path/to/file" as string },
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
      enumValues: {
        MyEnum: {
          First: 0,
          Second: 1,
        },
      },
      namespace: "" as string,
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should accept a shorthand store config as input and expand it", () => {
    const config = defineWorldWithShorthands({ tables: { Name: "address" } });

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Name: {
          label: "Name",
          type: "table",
          namespace: "" as string,
          name: "Name" as string,
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
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...CONFIG_DEFAULTS,
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
    attest<typeof config>(expectedConfig);
  });

  it("should accept a user type as input and expand it", () => {
    const config = defineWorldWithShorthands({
      tables: { Name: "CustomType" },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });

    const expectedBaseNamespace = {
      namespace: "" as string,
      tables: {
        Name: {
          label: "Name",
          type: "table",
          namespace: "" as string,
          name: "Name" as string,
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
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...CONFIG_DEFAULTS,
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" as string } },
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("given a schema with a key field with static ABI type, it should use `id` as single key", () => {
    const config = defineWorldWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
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
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...CONFIG_DEFAULTS,
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("given a schema with a key field with static custom type, it should use `id` as single key", () => {
    const config = defineWorldWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
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
          key: ["id"],
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
    } as const;

    const expectedConfig = {
      ...CONFIG_DEFAULTS,
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      userTypes: {},
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
  });

  it("throw an error if the shorthand doesn't include a key field", () => {
    attest(() =>
      defineWorldWithShorthands({
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
      defineWorldWithShorthands({ tables: { Example: { id: "string", name: "string", age: "uint256" } } }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static user type as key field", () => {
    attest(() =>
      defineWorldWithShorthands({
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

  it("should allow a const config as input", () => {
    const config = {
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age"],
        },
      },
    } as const;

    defineWorldWithShorthands(config);
  });

  it.skip("should throw with an invalid namespace config option", () => {
    attest(() =>
      defineWorldWithShorthands({
        // @ts-expect-error TODO
        namespaces: {
          ExampleNS: {
            tables: {
              ExampleTable: "number",
            },
          },
        },
      }),
    ).type.errors(`Type '"number"' is not assignable to type 'AbiType'.`);
  });

  it.skip("should throw with a non-existent namespace config option", () => {
    attest(() =>
      defineWorldWithShorthands({
        // @ts-expect-error TODO
        namespaces: {
          ExampleNS: {
            invalidProperty: true,
          },
        },
      }),
    ).type.errors("`invalidProperty` is not a valid namespace config option.");
  });
});
