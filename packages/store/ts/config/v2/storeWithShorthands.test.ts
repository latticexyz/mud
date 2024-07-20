import { describe, it } from "vitest";
import { defineStoreWithShorthands } from "./storeWithShorthands";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import { CODEGEN_DEFAULTS, TABLE_CODEGEN_DEFAULTS, TABLE_DEPLOY_DEFAULTS } from "./defaults";
import { defineStore } from "./store";
import { satisfy } from "@arktype/util";
import { Store } from "./output";

describe("defineStoreWithShorthands", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = defineStoreWithShorthands({ tables: { Name: "address" } });

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

  it("should satisfy the output type", () => {
    const config = defineStoreWithShorthands({
      tables: { Name: { schema: { id: "address" }, key: ["id"] } },
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
    });

    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should accept an empty input", () => {
    const config = defineStoreWithShorthands({});
    attest<typeof config, satisfy<Store, typeof config>>();
  });

  it("should accept a user type as input and expand it", () => {
    const config = defineStoreWithShorthands({
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
      ...expectedBaseNamespace,
      namespaces: {
        "": {
          label: "",
          ...expectedBaseNamespace,
        },
      },
      sourceDirectory: "src",
      userTypes: { CustomType: { type: "address", filePath: "path/to/file" } },
      enums: {},
      enumValues: {},
      codegen: CODEGEN_DEFAULTS,
    } as const;

    attest<typeof expectedConfig>(config).equals(expectedConfig);
    attest<typeof config>(expectedConfig);
  });

  it("given a schema with a key field with static ABI type, it should use `id` as single key", () => {
    const config = defineStoreWithShorthands({
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

  it("given a schema with a key field with static custom type, it should use `id` as single key", () => {
    const config = defineStoreWithShorthands({
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

  it("should pass through full table config inputs", () => {
    const config = defineStoreWithShorthands({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age", "id"],
        },
      },
    });
    const expected = defineStore({
      tables: {
        Example: {
          schema: { id: "address", name: "string", age: "uint256" },
          key: ["age", "id"],
        },
      },
    });

    attest<typeof expected>(config).equals(expected);
  });

  it("should throw if the shorthand doesn't include a key field", () => {
    attest(() =>
      defineStoreWithShorthands({
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
      defineStoreWithShorthands({ tables: { Example: { id: "string", name: "string", age: "uint256" } } }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("should throw if the shorthand config includes a non-static user type as key field", () => {
    attest(() =>
      defineStoreWithShorthands({
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
    attest(() => defineStoreWithShorthands({ tables: { Invalid: "NotAnAbiType" } }))
      .throws("Invalid ABI type. `NotAnAbiType` not found in scope.")
      .type.errors(`Type '"NotAnAbiType"' is not assignable to type 'AbiType'`);
  });
});
