import { describe, expectTypeOf } from "vitest";
import { mudConfig } from "../../register/mudConfig";
import { resolveConfig } from "./resolveConfig";

const config = resolveConfig(
  mudConfig({
    // Seems like we need `as const` here to keep the strong type.
    // Note it resolves to the strong `""` type if no namespace is provided.
    // TODO: require the entire input config to be `const`
    namespace: "the-namespace" as const,
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
  expectTypeOf<typeof config._resolved.tables.Shorthand.namespace>().toEqualTypeOf<"the-namespace">();

  expectTypeOf<typeof config._resolved.tables.Shorthand.name>().toEqualTypeOf<"Shorthand">();

  expectTypeOf<typeof config._resolved.tables.Shorthand.tableId>().toEqualTypeOf<`0x${string}`>();

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
