import { resolveConfig } from "./ts/config/experimental/resolveConfig";
import { mudConfig } from "./ts/register";

const config = mudConfig({
  storeImportPath: "../../",
  namespace: "store",
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
    Shorthand: {
      keySchema: {
        key: "ResourceId",
      },
      valueSchema: "ResourceId",
    },
  },
});

export default config;

const resolvedConfig = resolveConfig(config);

resolvedConfig.tables.Shorthand.keySchema.key;
//                                        ^?

resolvedConfig.tables.Shorthand.valueSchema.value;
//                                          ^?

resolvedConfig.resolved.tables.Shorthand.keySchema.key.type;
//                                                     ^?

resolvedConfig.resolved.tables.Shorthand.keySchema.key.internalType;
//                                                     ^?

resolvedConfig.resolved.tables.Shorthand.valueSchema.value.type;
//                                                         ^?

resolvedConfig.resolved.tables.Shorthand.valueSchema.value.internalType;
//                                                         ^?
