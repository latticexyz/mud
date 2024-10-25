export const doomWorldAbi = [
  {
    name: "send",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "uint256",
      },
      {
        type: "uint32[]",
      },
      {
        type: "bytes",
      },
    ],
    outputs: [],
  },
];

export const userOperationEventAbi = {
  type: "event",
  name: "UserOperationEvent",
  inputs: [
    {
      type: "bytes32",
      name: "userOpHash",
      indexed: true,
    },
    {
      type: "address",
      name: "sender",
      indexed: true,
    },
    {
      type: "address",
      name: "paymaster",
      indexed: true,
    },
    {
      type: "uint256",
      name: "nonce",
      indexed: false,
    },
    {
      type: "bool",
      name: "success",
      indexed: false,
    },
    {
      type: "uint256",
      name: "actualGasCost",
      indexed: false,
    },
    {
      type: "uint256",
      name: "actualGasUsed",
      indexed: false,
    },
  ],
} as const;
