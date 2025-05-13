export const entryPointSimulationsAbi = [
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
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "targetCallData",
        type: "bytes",
      },
    ],
    name: "simulateHandleOp",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "preOpGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paid",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accountValidationData",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paymasterValidationData",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "targetSuccess",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "targetResult",
            type: "bytes",
          },
        ],
        internalType: "struct IEntryPointSimulations.ExecutionResult",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
