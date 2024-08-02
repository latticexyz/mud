import { defineWorld } from "./ts/config/v2/world";

/**
 * @internal
 */
export const configInput = {
  namespace: "world", // NOTE: this namespace is only used for tables, the core system is deployed in the root namespace.
  codegen: {
    worldImportPath: "./src",
    worldgenDirectory: "interfaces",
    worldInterfaceName: "IBaseWorld",
  },
  userTypes: {
    ResourceId: { filePath: "@latticexyz/store/src/ResourceId.sol", type: "bytes32" },
  },
  tables: {
    NamespaceOwner: {
      schema: {
        namespaceId: "ResourceId",
        owner: "address",
      },
      key: ["namespaceId"],
    },
    ResourceAccess: {
      schema: {
        resourceId: "ResourceId",
        caller: "address",
        access: "bool",
      },
      key: ["resourceId", "caller"],
    },
    InstalledModules: {
      schema: {
        moduleAddress: "address",
        argumentsHash: "bytes32", // Hash of the params passed to the `install` function
        isInstalled: "bool",
      },
      key: ["moduleAddress", "argumentsHash"],
    },
    UserDelegationControl: {
      schema: {
        delegator: "address",
        delegatee: "address",
        delegationControlId: "ResourceId",
      },
      key: ["delegator", "delegatee"],
    },
    NamespaceDelegationControl: {
      schema: {
        namespaceId: "ResourceId",
        delegationControlId: "ResourceId",
      },
      key: ["namespaceId"],
    },
    Balances: {
      schema: {
        namespaceId: "ResourceId",
        balance: "uint256",
      },
      key: ["namespaceId"],
    },
    Systems: {
      schema: {
        systemId: "ResourceId",
        system: "address",
        publicAccess: "bool",
      },
      key: ["systemId"],
      codegen: {
        dataStruct: false,
      },
    },
    SystemRegistry: {
      schema: {
        system: "address",
        systemId: "ResourceId",
      },
      key: ["system"],
    },
    SystemHooks: {
      schema: {
        systemId: "ResourceId",
        value: "bytes21[]",
      },
      key: ["systemId"],
    },
    FunctionSelectors: {
      schema: {
        worldFunctionSelector: "bytes4",
        systemId: "ResourceId",
        systemFunctionSelector: "bytes4",
      },
      key: ["worldFunctionSelector"],
      codegen: {
        dataStruct: false,
      },
    },
    FunctionSignatures: {
      type: "offchainTable",
      schema: {
        functionSelector: "bytes4",
        functionSignature: "string",
      },
      key: ["functionSelector"],
    },
    InitModuleAddress: {
      schema: {
        value: "address",
      },
      key: [],
    },
  },
  excludeSystems: [
    // Worldgen currently does not support systems inheriting logic
    // from other contracts, so all parts of RegistrationSystem are named
    // System too to be included in the IBaseWorld interface.
    // However, IStoreRegistrationSystem overlaps with IStore if
    // included in IBaseWorld, so it needs to be excluded from worldgen.
    // TODO: add support for inheritance to worldgen
    // (see: https://github.com/latticexyz/mud/issues/631)
    "StoreRegistrationSystem",
  ],
} as const;

export default defineWorld(configInput);
