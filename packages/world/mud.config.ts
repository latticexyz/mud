import { mudConfig } from "./ts/register";

export default mudConfig({
  worldImportPath: "../",
  worldgenDirectory: "interfaces",
  worldInterfaceName: "IBaseWorld",
  codegenDirectory: "",
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", internalType: "bytes32" },
  },
  tables: {
    /************************************************************************
     *
     *    CORE TABLES
     *
     ************************************************************************/
    NamespaceOwner: {
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        owner: "address",
      },
    },
    ResourceAccess: {
      keySchema: {
        resourceId: "ResourceId",
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
    UserDelegationControl: {
      keySchema: {
        delegator: "address",
        delegatee: "address",
      },
      valueSchema: {
        delegationControlId: "ResourceId",
      },
    },
    FallbackDelegationControl: {
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        delegationControlId: "ResourceId",
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
        namespaceId: "ResourceId",
      },
      valueSchema: {
        balance: "uint256",
      },
    },
    Systems: {
      directory: "modules/core/tables",
      keySchema: {
        systemId: "ResourceId",
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
        systemId: "ResourceId",
      },
    },
    SystemHooks: {
      directory: "modules/core/tables",
      keySchema: {
        systemId: "ResourceId",
      },
      valueSchema: "bytes21[]",
    },
    FunctionSelectors: {
      directory: "modules/core/tables",
      keySchema: {
        functionSelector: "bytes4",
      },
      valueSchema: {
        systemId: "ResourceId",
        systemFunctionSelector: "bytes4",
      },
      dataStruct: false,
    },
    FunctionSignatures: {
      directory: "modules/core/tables",
      keySchema: {
        functionSelector: "bytes4",
      },
      valueSchema: {
        functionSignature: "string",
      },
      offchainOnly: true,
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
      keySchema: { sourceTableId: "ResourceId" },
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
        sourceTableId: "ResourceId",
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
        systemId: "ResourceId",
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
    TwoFields: {
      directory: "../test/tables",
      keySchema: {},
      valueSchema: {
        value1: "bool",
        value2: "bool",
      },
      tableIdArgument: true,
    },
    AddressArray: {
      directory: "../test/tables",
      valueSchema: "address[]",
      tableIdArgument: true,
    },
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
  ],
});
