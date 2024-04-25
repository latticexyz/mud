import path from "path";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";
import { tablegen } from "../codegen";
import { mudConfig } from "../register";

const config = mudConfig({
  storeImportPath: "../../../src/",
  namespace: "store",
  codegenDirectory: "../test/codegen",
  enums: {
    ExampleEnum: ["None", "First", "Second", "Third"],
  },
  tables: {
    Callbacks: "bytes24[]",
    Mixed: {
      valueSchema: {
        u32: "uint32",
        u128: "uint128",
        a32: "uint32[]",
        s: "string",
      },
    },
    Vector2: {
      valueSchema: {
        x: "uint32",
        y: "uint32",
      },
    },
    KeyEncoding: {
      keySchema: {
        k1: "uint256",
        k2: "int32",
        k3: "bytes16",
        k4: "address",
        k5: "bool",
        k6: "ExampleEnum",
      },
      valueSchema: "bool",
    },
  },
});

const srcDir = await getSrcDirectory();
const remappings = await getRemappings();

await tablegen(config, path.join(srcDir, config.codegenDirectory), remappings);
