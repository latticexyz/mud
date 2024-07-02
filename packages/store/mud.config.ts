import { defineStore } from "./ts/config/v2/store";

export default defineStore({
  codegen: {
    storeImportPath: "../../",
  },
  namespace: "store",
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
    // We allow defining resource names with >16 chars, but truncate to 16 chars when generating resource IDs to fit it into the resource ID's bytes16 name slot.
    // When hydrating a project from an existing MUD world, we'd like to restore the original resource name (instead of the truncated variant) for better UX.
    ResourceNames: {
      type: "offchainTable",
      schema: {
        resourceId: "ResourceId",
        name: "string",
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
