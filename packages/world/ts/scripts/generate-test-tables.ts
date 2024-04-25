import path from "path";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store/codegen";
import { mudConfig } from "../register";

const config = mudConfig({
  codegenDirectory: "../test/codegen",
  tables: {
    Bool: {
      keySchema: {},
      valueSchema: {
        value: "bool",
      },
      tableIdArgument: true,
    },
    TwoFields: {
      keySchema: {},
      valueSchema: {
        value1: "bool",
        value2: "bool",
      },
      tableIdArgument: true,
    },
    AddressArray: {
      valueSchema: "address[]",
      tableIdArgument: true,
    },
  },
});
const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegenDirectory), remappings);
