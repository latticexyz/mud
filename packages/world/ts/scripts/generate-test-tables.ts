import { getRemappings } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store/codegen";
import { defineWorld } from "../config/v2/world";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(import.meta.url);

const config = defineWorld({
  sourceDirectory: "../../test",
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

const remappings = await getRemappings();

await tablegen({ configPath, config, remappings });
