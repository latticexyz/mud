// TODO: replace this with abi-ts generated files once we move to
//       generating full TS files rather than DTS

export const worldCallAbi = [
  {
    type: "function",
    name: "batchCall",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallData[]",
        components: [
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchCallFrom",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallFromData[]",
        components: [
          {
            name: "from",
            type: "address",
            internalType: "address",
          },
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "callFrom",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "callWithSignature",
    inputs: [
      {
        name: "signer",
        type: "address",
        internalType: "address",
      },
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
] as const;

export type worldCallAbi = typeof worldCallAbi;
