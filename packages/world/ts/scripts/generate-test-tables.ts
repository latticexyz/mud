import path from "path";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store/codegen";
import { defineWorld } from "../config/v2/world";

const config = defineWorld({
  codegen: {
    outputDirectory: "../test/codegen",
  },
  tables: {
    Bool: {
      schema: {
        value: "bool",
      },
      key: [],
      codegen: { tableIdArgument: true },
    },
    TwoFields: {
      schema: {
        value1: "bool",
        value2: "bool",
      },
      key: [],
      codegen: { tableIdArgument: true },
    },
    AddressArray: {
      schema: {
        key: "bytes32",
        value: "address[]",
      },
      key: ["key"],
      codegen: { tableIdArgument: true },
    },
  },
});

const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegen.outputDirectory), remappings);
