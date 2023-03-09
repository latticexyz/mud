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
    Table2: {
      schema: {
        v1: SchemaType.UINT256_ARRAY,
        v2: SchemaType.INT32_ARRAY,
        v3: SchemaType.BYTES16_ARRAY,
        v4: SchemaType.ADDRESS_ARRAY,
        v5: SchemaType.BOOL_ARRAY,
      },
    },
    Table3: {
      schema: {
        v1: "Enum1",
      },
    },
    Singleton1: {
      dataStruct: false,
      primaryKeys: {},
      schema: {
        v1: SchemaType.INT256,
        v2: SchemaType.UINT256,
      },
    },
    Singleton2: {
      primaryKeys: {},
      schema: {
        v1: SchemaType.BYTES32_ARRAY,
      },
    },
  },

  userTypes: {
    enums: {
      Enum1: ["E1", "E2", "E3"],
      Enum2: ["E1"],
    },
  },

  prototypes: {
    Tables23: {
      tables: {
        Table2: {},
        Table3: {},
      },
    },
    Singletons: {
      tables: {
        Singleton1: { default: { v2: "123" } },
        Singleton2: {},
      },
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
