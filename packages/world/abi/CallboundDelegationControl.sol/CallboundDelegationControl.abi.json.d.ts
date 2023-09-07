declare const abi: [
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
        internalType: "address";
        name: "delegatee";
        type: "address";
      },
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "funcSelectorAndArgs";
        type: "bytes";
      },
      {
        internalType: "uint256";
        name: "numCalls";
        type: "uint256";
      }
    ];
    name: "initDelegation";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "address";
        name: "delegator";
        type: "address";
      },
      {
        internalType: "bytes32";
        name: "resourceSelector";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "funcSelectorAndArgs";
        type: "bytes";
      }
    ];
    name: "verify";
    outputs: [
      {
        internalType: "bool";
        name: "";
        type: "bool";
      }
    ];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
