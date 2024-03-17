import { describe, it } from "vitest";
import { resolveStoreWithShorthands } from "./store";
import { attest } from "@arktype/attest";
import { resourceToHex } from "@latticexyz/common";
import { CODEGEN_DEFAULTS, TABLE_CODEGEN_DEFAULTS } from "../defaults";

describe("resolveStoreWithShorthands", () => {
  it("should accept a shorthand store config as input and expand it", () => {
    const config = resolveStoreWithShorthands({ tables: { Name: "address" } });
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
    const config = resolveStoreWithShorthands({
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
    const config = resolveStoreWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
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
    const config = resolveStoreWithShorthands({
      tables: { Example: { id: "address", name: "string", age: "uint256" } },
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
      resolveStoreWithShorthands({
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
      resolveStoreWithShorthands({ tables: { Example: { id: "string", name: "string", age: "uint256" } } }),
    ).throwsAndHasTypeError(
      "Invalid schema. Expected an `id` field with a static ABI type or an explicit `key` option.",
    );
  });

  it("throw an error if the shorthand config includes a non-static user type as key field", () => {
    attest(() =>
      resolveStoreWithShorthands({
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
});
