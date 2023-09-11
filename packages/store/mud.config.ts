import { mudConfig } from "./ts/register";

export default mudConfig({
  storeImportPath: "../../",
  namespace: "mudstore",
  enums: {
    ExampleEnum: ["None", "First", "Second", "Third"],
  },
  tables: {
    StoreHooks: "bytes21[]",
    Callbacks: "bytes24[]",
    Tables: {
      keySchema: {
        tableId: "bytes32",
      },
      schema: {
        keySchema: "bytes32",
        valueSchema: "bytes32",
        abiEncodedKeyNames: "bytes",
        abiEncodedFieldNames: "bytes",
      },
    },
    // The Hooks table is a generic table used by the `filterFromList` util in `Hook.sol`
    Hooks: {
      schema: "bytes21[]",
      tableIdArgument: true,
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
