import { describe, expect, expectTypeOf, it } from "vitest";
import { parseConfig } from "./parseConfig";
import { tableIdToHex } from "@latticexyz/common";

describe("parseConfig", () => {
  it("outputs tables from config", () => {
    const config = parseConfig({
      tables: {
        Exists: "bool",
        Position: {
          valueSchema: { x: "uint32", y: "uint32" },
        },
        Messages: {
          offchainOnly: true,
          valueSchema: {
            sender: "address",
            message: "string",
          },
        },
      },
    });

    expect(config).toStrictEqual({
      tables: {
        Exists: {
          type: "table",
          namespace: "",
          name: "Exists",
          tableId: tableIdToHex("", "Exists"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            value: "bool",
          },
        },
        Position: {
          type: "table",
          namespace: "",
          name: "Position",
          tableId: tableIdToHex("", "Position"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            x: "uint32",
            y: "uint32",
          },
        },
        Messages: {
          type: "offchainTable",
          namespace: "",
          name: "Messages",
          tableId: tableIdToHex("", "Messages"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            message: "string",
            sender: "address",
          },
        },
      },
    } as const);

    expectTypeOf<typeof config>().toEqualTypeOf<
      Readonly<{
        tables: Readonly<{
          Exists: Readonly<{
            type: "table";
            namespace: "";
            name: "Exists";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ value: "bool" }>;
          }>;
          Position: Readonly<{
            type: "table";
            namespace: "";
            name: "Position";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ x: "uint32"; y: "uint32" }>;
          }>;
          Messages: Readonly<{
            type: "offchainTable";
            namespace: "";
            name: "Messages";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ sender: "address"; message: "string" }>;
          }>;
        }>;
      }>
    >();
  });

  it("handles namespaces", () => {
    const config = parseConfig({
      namespace: "DefaultNamespace",
      tables: {
        Exists: "bool",
        Position: {
          namespace: "TableNamespace",
          valueSchema: { x: "uint32", y: "uint32" },
        },
      },
      namespaces: {
        MyNamespace: {
          tables: {
            PlayerNames: "string",
            // TODO: make table overrides work or "throw"
            // Exists: {
            //   // TODO: disable overriding namespace here
            //   namespace: "OverrideNamespace",
            //   valueSchema: {
            //     exists: "bool",
            //   },
            // },
          },
        },
      },
    } as const);

    expect(config).toStrictEqual({
      tables: {
        Exists: {
          type: "table",
          namespace: "DefaultNamespace",
          name: "Exists",
          tableId: tableIdToHex("DefaultNamespace", "Exists"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            value: "bool",
          },
        },
        Position: {
          type: "table",
          namespace: "TableNamespace",
          name: "Position",
          tableId: tableIdToHex("TableNamespace", "Position"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            x: "uint32",
            y: "uint32",
          },
        },
        PlayerNames: {
          type: "table",
          namespace: "MyNamespace",
          name: "PlayerNames",
          tableId: tableIdToHex("MyNamespace", "PlayerNames"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            value: "string",
          },
        },
      },
    });

    expectTypeOf<typeof config>().toMatchTypeOf<
      Readonly<{
        tables: Readonly<{
          Exists: Readonly<{
            type: "table";
            namespace: "DefaultNamespace";
            name: "Exists";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ value: "bool" }>;
          }>;
          Position: Readonly<{
            type: "table";
            namespace: "TableNamespace";
            name: "Position";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ x: "uint32"; y: "uint32" }>;
          }>;
          PlayerNames: Readonly<{
            type: "table";
            namespace: "MyNamespace";
            name: "PlayerNames";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ value: "string" }>;
          }>;
        }>;
      }>
    >();
  });
});
