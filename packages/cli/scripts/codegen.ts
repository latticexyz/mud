import { SchemaType } from "@latticexyz/schema-type";
import { parseStoreConfig, StoreUserConfig } from "../src/config/index.js";
import { tablegen } from "../src/render-solidity/tablegen.js";
import { logError } from "../src/utils/errors.js";
import { getSrcDirectory } from "../src/utils/foundry.js";

// This config is used only for tests
const config: StoreUserConfig = {
  tables: {
    Table1: {
      primaryKeys: {
        k1: SchemaType.UINT256,
        k2: SchemaType.INT32,
        k3: SchemaType.BYTES16,
        k4: SchemaType.ADDRESS,
        k5: SchemaType.BOOL,
        k6: "Enum1",
        k7: "Enum2",
      },
      schema: {
        v1: SchemaType.UINT256,
        v2: SchemaType.INT32,
        v3: SchemaType.BYTES16,
        v4: SchemaType.ADDRESS,
        v5: SchemaType.BOOL,
        v6: "Enum1",
        v7: "Enum2",
      },
    },
  },

  userTypes: {
    enums: {
      Enum1: ["E1", "E2", "E3"],
      Enum2: ["E1"],
    },
  },
};

// Aside from avoiding `mud.config.mts` in cli package (could cause issues),
// this also tests that tablegen can work as a standalone function
const parsedConfig = await (async () => {
  try {
    return await parseStoreConfig(config);
  } catch (error: unknown) {
    logError(error);
  }
})();

const srcDirectory = await getSrcDirectory();
if (parsedConfig !== undefined) {
  tablegen(parsedConfig, srcDirectory);
} else {
  process.exit(1);
}
