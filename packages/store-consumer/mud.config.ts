import { defineStore } from "@latticexyz/store";

// Used for tablegen
export default defineStore({
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    Owner: {
      schema: {
        value: "address",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
    Paused: {
      schema: {
        paused: "bool",
      },
      key: [],
      codegen: {
        tableIdArgument: true,
      },
    },
  },
});
