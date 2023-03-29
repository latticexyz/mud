import { mudConfig } from "@latticexyz/cli";

export default mudConfig({
  worldImportPath: "../",
  worldgenDirectory: "interfaces",
  tables: {
    NamespaceOwner: {
      primaryKeys: {
        namespace: "bytes16",
      },
      schema: {
        owner: "address",
      },
      storeArgument: true,
    },
    ResourceAccess: {
      primaryKeys: {
        resourceSelector: "bytes32",
        caller: "address",
      },
      schema: {
        access: "bool",
      },
      storeArgument: true,
    },
    Systems: {
      primaryKeys: {
        resourceSelector: "bytes32",
      },
      schema: {
        system: "address",
        publicAccess: "bool",
      },
      storeArgument: true,
      dataStruct: false,
    },
    SystemRegistry: {
      directory: "/modules/registration/tables",
      primaryKeys: {
        system: "address",
      },
      schema: {
        resourceSelector: "bytes32",
      },
    },
    ResourceType: {
      directory: "/modules/registration/tables",
      primaryKeys: {
        resourceSelector: "bytes32",
      },
      schema: {
        resourceType: "Resource",
      },
    },
    FunctionSelectors: {
      fileSelector: "funcSelectors",
      primaryKeys: {
        functionSelector: "bytes4",
      },
      schema: {
        namespace: "bytes16",
        file: "bytes16",
        systemFunctionSelector: "bytes4",
      },
      dataStruct: false,
    },
    Bool: {
      // TODO: This table is only used for testing, move it to `test/tables` via the directory config once supported
      primaryKeys: {},
      schema: {
        value: "bool",
      },
      storeArgument: true,
      tableIdArgument: true,
    },
    AddressArray: {
      // TODO: This table is only used for testing, move it to `test/tables` via the directory config once supported
      schema: "address[]",
      storeArgument: true,
      tableIdArgument: true,
    },
    InstalledModules: {
      primaryKeys: {
        moduleName: "bytes16",
        argumentsHash: "bytes32", // Hash of the params passed to the `install` function
      },
      schema: {
        moduleAddress: "address",
      },
      // TODO: this is a workaround to use `getRecord` instead of `getField` in the autogen library,
      // to allow using the table before it is registered. This is because `getRecord` passes the schema
      // to store, while `getField` loads it from storage. Remove this once we have support for passing the
      // schema in `getField` too. (See https://github.com/latticexyz/mud/issues/444)
      dataStruct: true,
    },
    KeysWithValue: {
      directory: "/modules/keyswithvalue/tables",
      primaryKeys: {
        valueHash: "bytes32",
      },
      schema: {
        keysWithValue: "bytes32[]", // For now only supports 1 key per value
      },
      tableIdArgument: true,
      storeArgument: true,
    },
  },
  enums: {
    Resource: ["NONE", "NAMESPACE", "TABLE", "SYSTEM"],
  },

  recsGenerate: false,
});
