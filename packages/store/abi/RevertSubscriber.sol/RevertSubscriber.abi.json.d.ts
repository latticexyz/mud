declare const abi: [
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
        type: "bytes32[]";
      },
      {
        internalType: "Schema";
        name: "";
        type: "bytes32";
      }
    ];
    name: "onAfterDeleteRecord";
    outputs: [];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
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
        name: "";
        type: "bytes32";
      }
    ];
    name: "onAfterSetField";
    outputs: [];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "";
        type: "bytes32";
      }
    ];
    name: "onAfterSetRecord";
    outputs: [];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
        type: "bytes32[]";
      },
      {
        internalType: "Schema";
        name: "";
        type: "bytes32";
      }
    ];
    name: "onBeforeDeleteRecord";
    outputs: [];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
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
        name: "";
        type: "bytes32";
      }
    ];
    name: "onBeforeSetField";
    outputs: [];
    stateMutability: "pure";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "";
        type: "bytes32";
      }
    ];
    name: "onBeforeSetRecord";
    outputs: [];
    stateMutability: "pure";
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
  }
];
export default abi;
