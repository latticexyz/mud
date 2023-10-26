import { describe, expectTypeOf } from "vitest";
import { mudConfig } from "../../register/mudConfig";
import { resolveConfig } from "./resolveConfig";

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
  expectTypeOf<typeof config._resolved.tables.Shorthand.keySchema>().toEqualTypeOf<{
    key: {
      internalType: "ResourceId";
      type: "bytes32";
    };
  }>();

  expectTypeOf<typeof config._resolved.tables.Shorthand.valueSchema>().toEqualTypeOf<{
    value: {
      internalType: "ResourceType";
      type: "uint8";
    };
  }>();
});
