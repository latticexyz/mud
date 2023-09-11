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
    inputs: [];
    name: "StoreCore_NotDynamicField";
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
