import path from "path";
import { storeConfig, parseStoreConfig } from "@latticexyz/config";
import { tablegen } from "../src/render-solidity/tablegen.js";
import { logError } from "../src/utils/errors.js";
import { getSrcDirectory } from "../src/utils/foundry.js";

// This config is used only for tests
const config = storeConfig({
  tables: {
    Statics: {
      primaryKeys: {
        k1: "uint256",
        k2: "int32",
        k3: "bytes16",
        k4: "address",
        k5: "bool",
        k6: "Enum1",
        k7: "Enum2",
      },
      schema: {
        v1: "uint256",
        v2: "int32",
        v3: "bytes16",
        v4: "address",
        v5: "bool",
        v6: "Enum1",
        v7: "Enum2",
      },
    },
    Dynamics: {
      schema: {
        staticB32: "bytes32[1]",
        staticI32: "int32[2]",
        staticU128: "uint128[3]",
        staticAddrs: "address[4]",
        staticBools: "bool[5]",
        u64: "uint64[]",
        str: "string",
        b: "bytes",
      },
    },
    Singleton: {
      primaryKeys: {},
      schema: {
        v1: "int256",
        v2: "uint32[2]",
        v3: "uint32[2]",
        v4: "uint32[1]",
      },
      dataStruct: false,
    },
  },

  enums: {
    Enum1: ["E1", "E2", "E3"],
    Enum2: ["E1"],
  },
});

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
  tablegen(parsedConfig, path.join(srcDirectory, parsedConfig.codegenDirectory));
} else {
  process.exit(1);
}
