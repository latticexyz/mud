export const factoryAbi = [
  {
    inputs: [{ name: "implementation_", type: "address" }],
    stateMutability: "payable",
    type: "constructor",
  },
  { inputs: [], name: "OwnerRequired", type: "error" },
  {
    inputs: [
      { name: "owners", type: "bytes[]" },
      { name: "nonce", type: "uint256" },
    ],
    name: "createAccount",
    outputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "owners", type: "bytes[]" },
      { name: "nonce", type: "uint256" },
    ],
    name: "getAddress",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initCodeHash",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export type factoryAbi = typeof factoryAbi;
