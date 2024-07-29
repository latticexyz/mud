import { defineStore } from "./ts/config/v2/store";

export default defineStore({
  namespace: "store",
  codegen: {
    storeImportPath: "./src",
  },
  userTypes: {
    ResourceId: { filePath: "./src/ResourceId.sol", type: "bytes32" },
    FieldLayout: { filePath: "./src/FieldLayout.sol", type: "bytes32" },
    Schema: { filePath: "./src/Schema.sol", type: "bytes32" },
  },
  tables: {
    StoreHooks: {
      schema: {
        tableId: "ResourceId",
        hooks: "bytes21[]",
      },
      key: ["tableId"],
    },
    Tables: {
      schema: {
        tableId: "ResourceId",
        fieldLayout: "FieldLayout",
        keySchema: "Schema",
        valueSchema: "Schema",
        abiEncodedKeyNames: "bytes",
        abiEncodedFieldNames: "bytes",
      },
      key: ["tableId"],
    },
    ResourceIds: {
      schema: {
        resourceId: "ResourceId",
        exists: "bool",
      },
      key: ["resourceId"],
    },
    // The Hooks table is a generic table used by the `filterFromList` util in `Hook.sol`
    Hooks: {
      schema: {
        resourceId: "ResourceId",
        hooks: "bytes21[]",
      },
      key: ["resourceId"],
      codegen: {
        tableIdArgument: true,
      },
    },
  },
});
