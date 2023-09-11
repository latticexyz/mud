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
    inputs: [];
    name: "StoreCore_NotDynamicField";
    type: "error";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onAfterDeleteRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "";
        type: "uint8";
      },
      {
        internalType: "bytes";
        name: "";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onAfterSetField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "staticData";
        type: "bytes";
      },
      {
        internalType: "PackedCounter";
        name: "encodedLengths";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "dynamicData";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onAfterSetRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onBeforeDeleteRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "";
        type: "uint8";
      },
      {
        internalType: "bytes";
        name: "";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onBeforeSetField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "sourceTableId";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "staticData";
        type: "bytes";
      },
      {
        internalType: "PackedCounter";
        name: "encodedLengths";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "dynamicData";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "onBeforeSetRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
