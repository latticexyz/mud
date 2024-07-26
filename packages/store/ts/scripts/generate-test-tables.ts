import { tablegen } from "../codegen";
import { defineStore } from "../config/v2/store";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const config = defineStore({
  sourceDirectory: "test",
  codegen: {
    storeImportPath: "./src",
  },
  enums: {
    ExampleEnum: ["None", "First", "Second", "Third"],
  },
  tables: {
    Callbacks: {
      schema: { key: "bytes32", value: "bytes24[]" },
      key: ["key"],
    },
    Mixed: {
      schema: {
        key: "bytes32",
        u32: "uint32",
        u128: "uint128",
        a32: "uint32[]",
        s: "string",
      },
      key: ["key"],
    },
    Vector2: {
      schema: {
        key: "bytes32",
        x: "uint32",
        y: "uint32",
      },
      key: ["key"],
    },
    KeyEncoding: {
      schema: {
        k1: "uint256",
        k2: "int32",
        k3: "bytes16",
        k4: "address",
        k5: "bool",
        k6: "ExampleEnum",
        value: "bool",
      },
      key: ["k1", "k2", "k3", "k4", "k5", "k6"],
    },
  },
});

await tablegen({ rootDir, config });
