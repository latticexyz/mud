import { describe, expect, it } from "vitest";
import { mudConfig } from "../../register/mudConfig";
import { resolveConfig } from "./resolveConfig";
import { MUDCoreContext } from "@latticexyz/config";
import { resourceToHex } from "@latticexyz/common";
MUDCoreContext.createContext();

const config = resolveConfig(
  mudConfig({
    namespace: "the-namespace",
    userTypes: {
      ResourceId: {
        internalType: "bytes32",
        filePath: "",
      },
    },
    enums: {
      ResourceType: ["namespace", "system", "table"],
    },
    tables: {
      Shorthand: {
        keySchema: {
          key: "ResourceId",
        },
        valueSchema: "ResourceType",
      },
    },
  })
);

describe("resolveConfig", () => {
  it("should resolve userTypes and enums", () => {
    expect(config.tables.Shorthand.namespace).toEqual("the-namespace");

    expect(config.tables.Shorthand.name).toEqual("Shorthand");

    expect(config.tables.Shorthand.tableId).toEqual(
      resourceToHex({ type: "table", namespace: "the-namespace", name: "Shorthand" })
    );

    expect(config.tables.Shorthand.keySchema).toEqual({
      key: { internalType: "ResourceId", type: "bytes32" },
    });

    expect(config.tables.Shorthand.valueSchema).toEqual({
      value: { internalType: "ResourceType", type: "uint8" },
    });
  });
});
