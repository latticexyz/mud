import { mudConfig } from "./ts/register";

export default mudConfig({
  storeImportPath: "../../",
  namespace: "mudstore",
  enums: {
    ExampleEnum: ["None", "First", "Second", "Third"],
  },
  tables: {
    Hooks: "address[]",
    Callbacks: "bytes24[]",
    TableData: {
      keySchema: {
        tableId: "bytes32",
      },
      schema: {
        keySchema: "bytes32",
        valueSchema: "bytes32",
        abiEncodedKeyNames: "bytes",
        abiEncodedValueNames: "bytes",
      },
    },
    StoreMetadata: {
      keySchema: {
        tableId: "bytes32",
      },
      schema: {
        tableName: "string",
        abiEncodedFieldNames: "bytes",
      },
    },
    // TODO: move these test tables to a separate mud config
    Mixed: {
      schema: {
        u32: "uint32",
        u128: "uint128",
        a32: "uint32[]",
        s: "string",
      },
    },
    Vector2: {
      schema: {
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
      schema: "bool",
    },
  },
});
