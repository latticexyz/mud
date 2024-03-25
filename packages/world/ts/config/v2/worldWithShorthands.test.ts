import { describe, it } from "vitest";
import { defineWorldWithShorthands } from "./worldWithShorthands";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import {
  TABLE_CODEGEN_DEFAULTS,
  CODEGEN_DEFAULTS as STORE_CODEGEN_DEFAULTS,
  TABLE_DEPLOY_DEFAULTS,
} from "@latticexyz/store/config/v2";
import { CODEGEN_DEFAULTS as WORLD_CODEGEN_DEFAULTS, CONFIG_DEFAULTS } from "./defaults";
const CODEGEN_DEFAULTS = { ...STORE_CODEGEN_DEFAULTS, ...WORLD_CODEGEN_DEFAULTS };

describe("defineWorldWithShorthands", () => {
  it("should resolve namespaced shorthand table config with user types and enums", () => {
    const config = defineWorldWithShorthands({
      namespaces: {
        ExampleNamespace: {
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
        ExampleNamespace__ExampleTable: {
          tableId: resourceToHex({ type: "table", namespace: "ExampleNamespace", name: "ExampleTable" }),
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
          name: "ExampleTable",
          namespace: "ExampleNamespace",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
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
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should resolve namespaced shorthand schema table config with user types and enums", () => {
    const config = defineWorldWithShorthands({
      namespaces: {
        ExampleNamespace: {
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
        ExampleNamespace__ExampleTable: {
          tableId: resourceToHex({ type: "table", namespace: "ExampleNamespace", name: "ExampleTable" }),
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
          name: "ExampleTable",
          namespace: "ExampleNamespace",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
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
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("should accept a shorthand store config as input and expand it", () => {
    const config = defineWorldWithShorthands({ tables: { Name: "address" } });

    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
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
          key: ["id"],
          name: "Name",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
    attest<typeof config>(expected);
  });

  it("should accept a user type as input and expand it", () => {
    const config = defineWorldWithShorthands({
      tables: { Name: "CustomType" },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });
    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
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
          key: ["id"],
          name: "Name",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: false as boolean },
          type: "table",
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" as string } },
      enums: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static ABI type, it should use `id` as single key", () => {
    const config = defineWorldWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
    });
    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
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
          key: ["id"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
  });

  it("given a schema with a key field with static custom type, it should use `id` as single key", () => {
    const config = defineWorldWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
    });
    const expected = {
      ...CONFIG_DEFAULTS,
      codegen: CODEGEN_DEFAULTS,
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
          key: ["id"],
          name: "Example",
          namespace: "",
          codegen: { ...TABLE_CODEGEN_DEFAULTS, dataStruct: true as boolean },
          type: "table",
          deploy: TABLE_DEPLOY_DEFAULTS,
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config).equals(expected);
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
});
