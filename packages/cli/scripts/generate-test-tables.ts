import path from "path";
import { tablegen } from "@latticexyz/store";
import { mudConfig } from "@latticexyz/world/register";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { logError } from "../src/utils/errors";

// This config is used only for tests.
// Aside from avoiding `mud.config.mts` in cli package (could cause issues),
// this also tests that mudConfig and tablegen can work as standalone functions
let config;
try {
  config = mudConfig({
    tables: {
      Statics: {
        keySchema: {
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
        keySchema: {},
        schema: {
          v1: "int256",
          v2: "uint32[2]",
          v3: "uint32[2]",
          v4: "uint32[1]",
        },
        dataStruct: false,
      },
      Ephemeral: {
        schema: "uint256",
        ephemeral: true,
      },
    },

    enums: {
      Enum1: ["E1", "E2", "E3"],
      Enum2: ["E1"],
    },
  });
} catch (error: unknown) {
  logError(error);
}

const srcDirectory = await getSrcDirectory();

if (config !== undefined) {
  tablegen(config, path.join(srcDirectory, config.codegenDirectory));
} else {
  process.exit(1);
}
