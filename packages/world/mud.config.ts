import { mudConfig } from "./ts/register";

export default mudConfig({
  worldImportPath: "../",
  worldgenDirectory: "interfaces",
  worldInterfaceName: "IBaseWorld",
  codegenDirectory: "",
  tables: {
    /************************************************************************
     *
     *    CORE TABLES
     *
     ************************************************************************/
    NamespaceOwner: {
      keySchema: {
        namespace: "bytes16",
      },
      schema: {
        owner: "address",
      },
    },
    ResourceAccess: {
      keySchema: {
        resourceSelector: "bytes32",
        caller: "address",
      },
      schema: {
        access: "bool",
      },
    },
    InstalledModules: {
      keySchema: {
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
    /************************************************************************
     *
     *    MODULE TABLES
     *
     ************************************************************************/
    Systems: {
      directory: "modules/core/tables",
      keySchema: {
        resourceSelector: "bytes32",
      },
      schema: {
        system: "address",
        publicAccess: "bool",
      },
      dataStruct: false,
    },
    SystemRegistry: {
      directory: "modules/core/tables",
      keySchema: {
        system: "address",
      },
      schema: {
        resourceSelector: "bytes32",
      },
    },
    SystemHooks: {
      directory: "modules/core/tables",
      keySchema: {
        resourceSelector: "bytes32",
      },
      schema: "address[]",
    },
    ResourceType: {
      directory: "modules/core/tables",
      keySchema: {
        resourceSelector: "bytes32",
      },
      schema: {
        resourceType: "Resource",
      },
    },
    FunctionSelectors: {
      directory: "modules/core/tables",
      keySchema: {
        functionSelector: "bytes4",
      },
      schema: {
        namespace: "bytes16",
        name: "bytes16",
        systemFunctionSelector: "bytes4",
      },
      dataStruct: false,
    },
    KeysWithValue: {
      directory: "modules/keyswithvalue/tables",
      keySchema: {
        valueHash: "bytes32",
      },
      schema: {
        keysWithValue: "bytes32[]", // For now only supports 1 key per value
      },
      tableIdArgument: true,
    },
    KeysInTable: {
      directory: "modules/keysintable/tables",
      keySchema: { sourceTable: "bytes32" },
      schema: {
        keys0: "bytes32[]",
        keys1: "bytes32[]",
        keys2: "bytes32[]",
        keys3: "bytes32[]",
        keys4: "bytes32[]",
      },
    },
    UsedKeysIndex: {
      directory: "modules/keysintable/tables",
      keySchema: {
        sourceTable: "bytes32",
        keysHash: "bytes32",
      },
      schema: { has: "bool", index: "uint32" },
      dataStruct: false,
    },
    UniqueEntity: {
      directory: "modules/uniqueentity/tables",
      keySchema: {},
      schema: "uint256",
      tableIdArgument: true,
      storeArgument: true,
    },
    /************************************************************************
     *
     *    TEST TABLES
     *
     ************************************************************************/
    Bool: {
      directory: "../test/tables",
      keySchema: {},
      schema: {
        value: "bool",
      },
      tableIdArgument: true,
    },
    AddressArray: {
      directory: "../test/tables",
      schema: "address[]",
      tableIdArgument: true,
    },
  },
  enums: {
    Resource: ["NONE", "NAMESPACE", "TABLE", "SYSTEM"],
  },

  excludeSystems: [
    // IUniqueEntitySystem is not part of the root namespace and
    // installed separately by UniqueEntityModule.
    // TODO: Move optional modules into a separate package
    // (see https://github.com/latticexyz/mud/pull/584)
    "UniqueEntitySystem",

    "SnapSyncSystem",

    // Worldgen currently does not support systems inheriting logic
    // from other contracts, so all parts of CoreSystem are named
    // System too to be included in the IBaseWorld interface.
    // However, IStoreRegistrationSystem overlaps with IStore if
    // included in IBaseWorld, so it needs to be excluded from worldgen.
    // TODO: add support for inheritance to worldgen
    // (see: https://github.com/latticexyz/mud/issues/631)
    "StoreRegistrationSystem",
    // Similar overlap occurs for IEphemeralRecordSystem. IWorldEphemeral is included instead.
    "EphemeralRecordSystem",
  ],
});
