import { describe, expect, expectTypeOf, it } from "vitest";
import { parseConfig } from "./config";
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
          name: "Exists",
          namespace: "",
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
          name: "Position",
          namespace: "",
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
          name: "Messages",
          namespace: "",
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

    expectTypeOf<typeof config>().toMatchTypeOf<
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

  it("handles default namespace and per-table namespaces", () => {
    const config = parseConfig({
      namespace: "MyNamespace",
      tables: {
        Exists: "bool",
        Position: {
          namespace: "OtherNamespace",
          valueSchema: { x: "uint32", y: "uint32" },
        },
      },
    } as const);

    expect(config).toStrictEqual({
      tables: {
        Exists: {
          type: "table",
          name: "Exists",
          namespace: "MyNamespace",
          tableId: tableIdToHex("MyNamespace", "Exists"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            value: "bool",
          },
        },
        Position: {
          type: "table",
          name: "Position",
          namespace: "OtherNamespace",
          tableId: tableIdToHex("OtherNamespace", "Position"),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            x: "uint32",
            y: "uint32",
          },
        },
      },
    });

    expectTypeOf<typeof config>().toMatchTypeOf<
      Readonly<{
        tables: Readonly<{
          Exists: Readonly<{
            type: "table";
            namespace: "MyNamespace";
            name: "Exists";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ value: "bool" }>;
          }>;
          Position: Readonly<{
            type: "table";
            namespace: "OtherNamespace";
            name: "Position";
            tableId: `0x${string}`;
            keySchema: Readonly<{ key: "bytes32" }>;
            valueSchema: Readonly<{ x: "uint32"; y: "uint32" }>;
          }>;
        }>;
      }>
    >();
  });
});
