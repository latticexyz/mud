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
      valueSchema: {
        owner: "address",
      },
    },
    ResourceAccess: {
      keySchema: {
        resourceId: "bytes32",
        caller: "address",
      },
      valueSchema: {
        access: "bool",
      },
    },
    InstalledModules: {
      keySchema: {
        moduleName: "bytes16",
        argumentsHash: "bytes32", // Hash of the params passed to the `install` function
      },
      valueSchema: {
        moduleAddress: "address",
      },
    },
    Delegations: {
      keySchema: {
        delegator: "address",
        delegatee: "address",
      },
      valueSchema: {
        delegationControlId: "bytes32",
      },
    },
    /************************************************************************
     *
     *    MODULE TABLES
     *
     ************************************************************************/
    Balances: {
      directory: "modules/core/tables",
      keySchema: {
        namespace: "bytes16",
      },
      valueSchema: {
        balance: "uint256",
      },
    },
    Systems: {
      directory: "modules/core/tables",
      keySchema: {
        systemId: "bytes32",
      },
      valueSchema: {
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
      valueSchema: {
        systemId: "bytes32",
      },
    },
    SystemHooks: {
      directory: "modules/core/tables",
      keySchema: {
        systemId: "bytes32",
      },
      valueSchema: "bytes21[]",
    },
    ResourceType: {
      directory: "modules/core/tables",
      keySchema: {
        systemId: "bytes32",
      },
      valueSchema: {
        resourceType: "Resource",
      },
    },
    FunctionSelectors: {
      directory: "modules/core/tables",
      keySchema: {
        functionSelector: "bytes4",
      },
      valueSchema: {
        systemId: "bytes32",
        systemFunctionSelector: "bytes4",
      },
      dataStruct: false,
    },
    KeysWithValue: {
      directory: "modules/keyswithvalue/tables",
      keySchema: {
        valueHash: "bytes32",
      },
      valueSchema: {
        keysWithValue: "bytes32[]", // For now only supports 1 key per value
      },
      tableIdArgument: true,
    },
    KeysInTable: {
      directory: "modules/keysintable/tables",
      keySchema: { sourceTable: "bytes32" },
      valueSchema: {
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
      valueSchema: { has: "bool", index: "uint40" },
      dataStruct: false,
    },
    UniqueEntity: {
      directory: "modules/uniqueentity/tables",
      keySchema: {},
      valueSchema: "uint256",
      tableIdArgument: true,
      storeArgument: true,
    },
    CallboundDelegations: {
      directory: "modules/std-delegations/tables",
      keySchema: {
        delegator: "address",
        delegatee: "address",
        systemId: "bytes32",
        callDataHash: "bytes32",
      },
      valueSchema: {
        availableCalls: "uint256",
      },
    },
    TimeboundDelegations: {
      directory: "modules/std-delegations/tables",
      keySchema: {
        delegator: "address",
        delegatee: "address",
      },
      valueSchema: {
        maxTimestamp: "uint256",
      },
    },
    /************************************************************************
     *
     *    TEST TABLES
     *
     ************************************************************************/
    Bool: {
      directory: "../test/tables",
      keySchema: {},
      valueSchema: {
        value: "bool",
      },
      tableIdArgument: true,
    },
    AddressArray: {
      directory: "../test/tables",
      valueSchema: "address[]",
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
