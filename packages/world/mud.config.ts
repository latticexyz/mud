import { defineWorld } from "./ts/config/v2/world";

// Ideally we'd use a single multi-namespace config here, but we don't want
// to break imports from this package because the source location changed.
//
// Once we have more nuanced control over source paths and codegen for each
// namespace, then we could probably migrate to multi-namespace config.
//
// Or some way to deeply merge multiple configs while retaining strong types.

/** @internal */
export const tablesConfig = defineWorld({
  namespace: "world",
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
});

/** @internal */
export const systemsConfig = defineWorld({
  namespace: "",
  codegen: {
    worldImportPath: "./src",
    worldgenDirectory: "interfaces",
    worldInterfaceName: "IBaseWorld",
    generateSystemLibraries: true,
  },
  systems: {
    AccessManagementSystem: {
      name: "AccessManagement",
    },
    BalanceTransferSystem: {
      name: "BalanceTransfer",
    },
    BatchCallSystem: {
      name: "BatchCall",
    },
    RegistrationSystem: {
      name: "Registration",
    },
    // abstract systems that are deployed as part of RegistrationSystem
    ModuleInstallationSystem: {
      name: "Registration",
    },
    StoreRegistrationSystem: {
      name: "Registration",
    },
    WorldRegistrationSystem: {
      name: "Registration",
    },
  },
});

export default tablesConfig;
