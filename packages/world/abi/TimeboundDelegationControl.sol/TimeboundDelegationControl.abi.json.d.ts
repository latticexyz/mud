declare const abi: [
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
        internalType: "uint8";
        name: "fieldIndex";
        type: "uint8";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreSetField";
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
        internalType: "address";
        name: "delegatee";
        type: "address";
      },
      {
        internalType: "uint256";
        name: "maxTimestamp";
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
        internalType: "address";
        name: "delegator";
        type: "address";
      },
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes";
        name: "";
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
    stateMutability: "view";
    type: "function";
  }
];
export default abi;
