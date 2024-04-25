import { mudConfig } from "./ts/register";

export default mudConfig({
  storeImportPath: "../../",
  namespace: "store" as const,
  userTypes: {
    ResourceId: { filePath: "./src/ResourceId.sol", internalType: "bytes32" },
    FieldLayout: { filePath: "./src/FieldLayout.sol", internalType: "bytes32" },
    Schema: { filePath: "./src/Schema.sol", internalType: "bytes32" },
  },
  tables: {
    StoreHooks: {
      keySchema: {
        tableId: "ResourceId",
      },
      valueSchema: {
        hooks: "bytes21[]",
      },
    },
    Tables: {
      keySchema: {
        tableId: "ResourceId",
      },
      valueSchema: {
        fieldLayout: "FieldLayout",
        keySchema: "Schema",
        valueSchema: "Schema",
        abiEncodedKeyNames: "bytes",
        abiEncodedFieldNames: "bytes",
      },
    },
    ResourceIds: {
      keySchema: {
        resourceId: "ResourceId",
      },
      valueSchema: {
        exists: "bool",
      },
    },
    // The Hooks table is a generic table used by the `filterFromList` util in `Hook.sol`
    Hooks: {
      keySchema: {
        resourceId: "ResourceId",
      },
      valueSchema: {
        hooks: "bytes21[]",
      },
      tableIdArgument: true,
    },
  },
});
