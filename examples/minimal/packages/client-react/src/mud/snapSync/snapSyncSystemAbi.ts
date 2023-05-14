export default [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "tableId",
        type: "bytes32",
      },
    ],
    name: "snapSync_system_getNumKeysInTable",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "tableId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      },
    ],
    name: "snapSync_system_getRecords",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "tableId",
            type: "bytes32",
          },
          {
            internalType: "bytes32[]",
            name: "keyTuple",
            type: "bytes32[]",
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes",
          },
        ],
        internalType: "struct SyncRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
