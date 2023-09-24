import { mudConfig } from "./ts/register";

export default mudConfig({
  storeImportPath: "../../",
  namespace: "mudstore",
  enums: {
    ExampleEnum: ["None", "First", "Second", "Third"],
  },
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
    // TODO: move these test tables to a separate mud config
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
