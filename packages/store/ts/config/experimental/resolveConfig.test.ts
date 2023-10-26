import { describe, expect, it } from "vitest";
import { mudConfig } from "../../register/mudConfig";
import { resolveConfig } from "./resolveConfig";
import { MUDCoreContext } from "@latticexyz/config";
MUDCoreContext.createContext();

const config = resolveConfig(
  mudConfig({
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
    expect(config._resolved.tables.Shorthand.keySchema).toEqual({
      key: { internalType: "ResourceId", type: "bytes32" },
    });
    expect(config._resolved.tables.Shorthand.valueSchema).toEqual({
      value: { internalType: "ResourceType", type: "uint8" },
    });
  });
});
