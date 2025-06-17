export const entryPointGasSimulationsAbi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "accountGasLimits",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "gasFees",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct PackedUserOperation",
        name: "op",
        type: "tuple",
      },
    ],
    name: "estimateGas",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "verificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "callGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paymasterVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paymasterPostOpGas",
            type: "uint256",
          },
        ],
        internalType: "struct EntryPoint.GasInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
