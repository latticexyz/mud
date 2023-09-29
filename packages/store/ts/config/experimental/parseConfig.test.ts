import { describe, expect, expectTypeOf, it } from "vitest";
import { parseConfig } from "./parseConfig";
import { resourceIdToHex } from "@latticexyz/common";

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
    } as const);

    const expectedOutput = {
      tables: {
        Exists: {
          type: "table",
          namespace: "",
          name: "Exists",
          tableId: resourceIdToHex({ type: "table", namespace: "", name: "Exists" }),
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
          tableId: resourceIdToHex({ type: "table", namespace: "", name: "Position" }),
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
          tableId: resourceIdToHex({ type: "offchainTable", namespace: "", name: "Messages" }),
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
            Exists: {
              // TODO: disable overriding namespace here
              namespace: "OverrideNamespace",
              valueSchema: {
                exists: "bool",
              },
            },
          },
        },
      },
    } as const);

    const expectedOutput = {
      tables: {
        Exists: {
          type: "table",
          namespace: "OverrideNamespace",
          name: "Exists",
          tableId: resourceIdToHex({ type: "table", namespace: "OverrideNamespace", name: "Exists" }),
          keySchema: {
            key: "bytes32",
          },
          valueSchema: {
            exists: "bool",
          },
        },
        Position: {
          type: "table",
          namespace: "TableNamespace",
          name: "Position",
          tableId: resourceIdToHex({ type: "table", namespace: "TableNamespace", name: "Position" }),
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
          tableId: resourceIdToHex({ type: "table", namespace: "MyNamespace", name: "PlayerNames" }),
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
