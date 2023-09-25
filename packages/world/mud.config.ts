import { mudConfig } from "./ts/register";

export default mudConfig({
  worldImportPath: "../../",
  worldgenDirectory: "interfaces",
  worldInterfaceName: "IBaseWorld",
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", internalType: "bytes32" },
  },
  tables: {
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
    Balances: {
      keySchema: {
        namespaceId: "ResourceId",
      },
      valueSchema: {
        balance: "uint256",
      },
    },
    Systems: {
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
      keySchema: {
        system: "address",
      },
      valueSchema: {
        systemId: "ResourceId",
      },
    },
    SystemHooks: {
      keySchema: {
        systemId: "ResourceId",
      },
      valueSchema: "bytes21[]",
    },
    FunctionSelectors: {
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
      keySchema: {
        functionSelector: "bytes4",
      },
      valueSchema: {
        functionSignature: "string",
      },
      offchainOnly: true,
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
