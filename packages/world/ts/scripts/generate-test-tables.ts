import { tablegen } from "@latticexyz/store/codegen";
import { defineWorld } from "../config/v2/world";
import { fileURLToPath } from "node:url";
import path from "node:path/posix";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const config = defineWorld({
  sourceDirectory: "test",
  tables: {
    Bool: {
      schema: {
        value: "bool",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    TwoFields: {
      schema: {
        value1: "bool",
        value2: "bool",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    AddressArray: {
      schema: {
        key: "bytes32",
        value: "address[]",
      },
      key: ["key"],
      codegen: {
        tableIdArgument: true,
      },
    },
  },
});

await tablegen({ rootDir, config });
