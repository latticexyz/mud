import path from "path";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { defineStore } from "../config/v2/store";

const config = defineStore({
  codegen: {
    storeImportPath: "../../../src/",
    outputDirectory: "../test/codegen",
  },
  namespace: "store",
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

const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegen.outputDirectory), remappings);
