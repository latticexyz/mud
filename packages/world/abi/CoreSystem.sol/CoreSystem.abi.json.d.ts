declare const abi: [
  {
    inputs: [
      {
        internalType: "string";
        name: "resource";
        type: "string";
      },
      {
        internalType: "address";
        name: "caller";
        type: "address";
      }
    ];
    name: "AccessDenied";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "address";
        name: "delegator";
        type: "address";
      },
      {
        internalType: "address";
        name: "delegatee";
        type: "address";
      }
    ];
    name: "DelegationNotFound";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "length";
        type: "uint256";
      }
    ];
    name: "FieldLayoutLib_InvalidLength";
    type: "error";
  },
  {
    inputs: [];
    name: "FieldLayoutLib_StaticLengthDoesNotFitInAWord";
    type: "error";
  },
  {
    inputs: [];
    name: "FieldLayoutLib_StaticLengthIsZero";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "bytes4";
        name: "functionSelector";
        type: "bytes4";
      }
    ];
    name: "FunctionSelectorExists";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "bytes4";
        name: "functionSelector";
        type: "bytes4";
      }
    ];
    name: "FunctionSelectorNotFound";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "balance";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "amount";
        type: "uint256";
      }
    ];
    name: "InsufficientBalance";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "address";
        name: "contractAddress";
        type: "address";
      },
      {
        internalType: "bytes4";
        name: "interfaceId";
        type: "bytes4";
      }
    ];
    name: "InterfaceNotSupported";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "string";
        name: "resource";
        type: "string";
      }
    ];
    name: "InvalidSelector";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "string";
        name: "module";
        type: "string";
      }
    ];
    name: "ModuleAlreadyInstalled";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "length";
        type: "uint256";
      }
    ];
    name: "PackedCounter_InvalidLength";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "string";
        name: "resource";
        type: "string";
      }
    ];
    name: "ResourceExists";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "string";
        name: "resource";
        type: "string";
      }
    ];
    name: "ResourceNotFound";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "length";
        type: "uint256";
      }
    ];
    name: "SchemaLib_InvalidLength";
    type: "error";
  },
  {
    inputs: [];
    name: "SchemaLib_StaticTypeAfterDynamicType";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "bytes";
        name: "data";
        type: "bytes";
      },
      {
        internalType: "uint256";
        name: "start";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "end";
        type: "uint256";
      }
    ];
    name: "Slice_OutOfBounds";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "expected";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "received";
        type: "uint256";
      }
    ];
    name: "StoreCore_InvalidDataLength";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "expected";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "received";
        type: "uint256";
      }
    ];
    name: "StoreCore_InvalidFieldNamesLength";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "expected";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "received";
        type: "uint256";
      }
    ];
    name: "StoreCore_InvalidKeyNamesLength";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "uint256";
        name: "expected";
        type: "uint256";
      },
      {
        internalType: "uint256";
        name: "received";
        type: "uint256";
      }
    ];
    name: "StoreCore_InvalidValueSchemaLength";
    type: "error";
  },
  {
    inputs: [];
    name: "StoreCore_NotDynamicField";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        internalType: "string";
        name: "tableIdString";
        type: "string";
      }
    ];
    name: "StoreCore_TableAlreadyExists";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "address";
        name: "system";
        type: "address";
      }
    ];
    name: "SystemExists";
    type: "error";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreEphemeralRecord";
    type: "event";
  },
  {
    inputs: [];
    name: "_msgSender";
    outputs: [
      {
        internalType: "address";
        name: "sender";
        type: "address";
      }
    ];
    stateMutability: "view";
    type: "function";
  },
  {
    inputs: [];
    name: "_msgValue";
    outputs: [
      {
        internalType: "uint256";
        name: "value";
        type: "uint256";
      }
    ];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [];
    name: "_world";
    outputs: [
      {
        internalType: "address";
        name: "";
        type: "address";
      }
    ];
    stateMutability: "view";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "data";
        type: "bytes";
      },
      {
        internalType: "FieldLayout";
        name: "fieldLayout";
        type: "bytes32";
      }
    ];
    name: "emitEphemeralRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "address";
        name: "grantee";
        type: "address";
      }
    ];
    name: "grantAccess";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "contract IModule";
        name: "module";
        type: "address";
      },
      {
        internalType: "bytes";
        name: "args";
        type: "bytes";
      }
    ];
    name: "installModule";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "address";
        name: "delegatee";
        type: "address";
      },
      {
        internalType: "bytes32";
        name: "delegationControlId";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "initFuncSelectorAndArgs";
        type: "bytes";
      }
    ];
    name: "registerDelegation";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "string";
        name: "systemFunctionName";
        type: "string";
      },
      {
        internalType: "string";
        name: "systemFunctionArguments";
        type: "string";
      }
    ];
    name: "registerFunctionSelector";
    outputs: [
      {
        internalType: "bytes4";
        name: "worldFunctionSelector";
        type: "bytes4";
      }
    ];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "namespace";
        type: "bytes16";
      }
    ];
    name: "registerNamespace";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "bytes4";
        name: "worldFunctionSelector";
        type: "bytes4";
      },
      {
        internalType: "bytes4";
        name: "systemFunctionSelector";
        type: "bytes4";
      }
    ];
    name: "registerRootFunctionSelector";
    outputs: [
      {
        internalType: "bytes4";
        name: "";
        type: "bytes4";
      }
    ];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        internalType: "contract IStoreHook";
        name: "hookAddress";
        type: "address";
      },
      {
        internalType: "uint8";
        name: "enabledHooksBitmap";
        type: "uint8";
      }
    ];
    name: "registerStoreHook";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "contract WorldContextConsumer";
        name: "system";
        type: "address";
      },
      {
        internalType: "bool";
        name: "publicAccess";
        type: "bool";
      }
    ];
    name: "registerSystem";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "contract ISystemHook";
        name: "hookAddress";
        type: "address";
      },
      {
        internalType: "uint8";
        name: "enabledHooksBitmap";
        type: "uint8";
      }
    ];
    name: "registerSystemHook";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "FieldLayout";
        name: "fieldLayout";
        type: "bytes32";
      },
      {
        internalType: "Schema";
        name: "keySchema";
        type: "bytes32";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      },
      {
        internalType: "string[]";
        name: "keyNames";
        type: "string[]";
      },
      {
        internalType: "string[]";
        name: "fieldNames";
        type: "string[]";
      }
    ];
    name: "registerTable";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "address";
        name: "grantee";
        type: "address";
      }
    ];
    name: "revokeAccess";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes4";
        name: "interfaceId";
        type: "bytes4";
      }
    ];
    name: "supportsInterface";
    outputs: [
      {
        internalType: "bool";
        name: "";
        type: "bool";
      }
    ];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "fromNamespace";
        type: "bytes16";
      },
      {
        internalType: "address";
        name: "toAddress";
        type: "address";
      },
      {
        internalType: "uint256";
        name: "amount";
        type: "uint256";
      }
    ];
    name: "transferBalanceToAddress";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "fromNamespace";
        type: "bytes16";
      },
      {
        internalType: "bytes16";
        name: "toNamespace";
        type: "bytes16";
      },
      {
        internalType: "uint256";
        name: "amount";
        type: "uint256";
      }
    ];
    name: "transferBalanceToNamespace";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes16";
        name: "namespace";
        type: "bytes16";
      },
      {
        internalType: "address";
        name: "newOwner";
        type: "address";
      }
    ];
    name: "transferOwnership";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "tableId";
        type: "bytes32";
      },
      {
        internalType: "contract IStoreHook";
        name: "hookAddress";
        type: "address";
      }
    ];
    name: "unregisterStoreHook";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "contract ISystemHook";
        name: "hookAddress";
        type: "address";
      }
    ];
    name: "unregisterSystemHook";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
