import { tablegen } from "@latticexyz/store/codegen";
import { defineStore } from "@latticexyz/store";
import { fileURLToPath } from "node:url";
import path from "node:path/posix";

const configPath = fileURLToPath(import.meta.url);

// This config is used only for tests.
// Aside from avoiding `mud.config.ts` in cli package (could cause issues),
// this also tests that mudConfig and tablegen can work as standalone functions
const config = defineStore({
  sourceDirectory: "../contracts/src",
  enums: {
    Enum1: ["E1", "E2", "E3"],
    Enum2: ["E1"],
  },
  userTypes: {
    TestTypeAddress: { filePath: "../contracts/src/types.sol", type: "address" },
    TestTypeInt64: { filePath: "../contracts/src/types.sol", type: "int64" },
    "TestTypeLibrary.TestTypeBool": { filePath: "../contracts/src/types.sol", type: "bool" },
    "TestTypeLibrary.TestTypeUint128": { filePath: "../contracts/src/types.sol", type: "uint128" },
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    Statics: {
      schema: {
        k1: "uint256",
        k2: "int32",
        k3: "bytes16",
        k4: "address",
        k5: "bool",
        k6: "Enum2",
        v1: "uint256",
        v2: "int32",
        v3: "bytes16",
        v4: "address",
        v5: "bool",
        v6: "Enum1",
      },
      key: ["k1", "k2", "k3", "k4", "k5", "k6"],
    },
    Dynamics1: {
      schema: {
        key: "bytes32",
        staticB32: "bytes32[1]",
        staticI32: "int32[2]",
        staticU128: "uint128[3]",
        staticAddrs: "address[4]",
        staticBools: "bool[5]",
      },
      key: ["key"],
    },
    Dynamics2: {
      schema: {
        key: "bytes32",
        u64: "uint64[]",
        str: "string",
        b: "bytes",
      },
      key: ["key"],
    },
    Singleton: {
      schema: {
        v1: "int256",
        v2: "uint32[2]",
        v3: "uint32[2]",
        v4: "uint32[1]",
      },
      key: [],
      codegen: { dataStruct: false },
    },
    Offchain: {
      type: "offchainTable",
      schema: {
        key: "bytes32",
        value: "uint256",
      },
      key: ["key"],
    },
    UserTyped: {
      schema: {
        k1: "TestTypeAddress",
        k2: "TestTypeInt64",
        k3: "TestTypeLibrary.TestTypeBool",
        k4: "TestTypeLibrary.TestTypeUint128",
        k5: "ResourceId",
        v1: "TestTypeAddress",
        v2: "TestTypeInt64",
        v3: "TestTypeLibrary.TestTypeBool",
        v4: "TestTypeLibrary.TestTypeUint128",
        v5: "ResourceId",
      },
      key: ["k1", "k2", "k3", "k4", "k5"],
    },
  },
});

await tablegen({ rootDir: path.dirname(configPath), config });
