import { describe, expect, expectTypeOf, it } from "vitest";
import { parseConfig } from "./parseConfig";
import { tableIdToHex } from "@latticexyz/common";

describe("parseConfig", () => {
  it("outputs tables from config", () => {
    const output = parseConfig({
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

    const expectedOutput = {
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
    } as const;

    expect(output).toStrictEqual(expectedOutput);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });

  it("handles namespaces", () => {
    const output = parseConfig({
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

    const expectedOutput = {
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
    } as const;

    expect(output).toStrictEqual(expectedOutput);
    expectTypeOf(output).toEqualTypeOf(expectedOutput);
    expectTypeOf(output).toMatchTypeOf(expectedOutput);
  });
});
