export const abi = [
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];
