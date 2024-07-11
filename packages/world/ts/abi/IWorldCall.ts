// TODO: figure out how to resolve the conflict between `resolveJsonModule: true` and our generated ABI `.abi.json.d.ts` files.
export const abi = [
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
] as const;
