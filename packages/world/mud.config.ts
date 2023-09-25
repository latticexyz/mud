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
    NamespaceDelegationControl: {
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        delegationControlId: "ResourceId",
      },
    },
    /************************************************************************
     *
     *    CORE MODULE TABLES
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
