import { BundlerRpcSchema, RpcUserOperation } from "viem";
import {
  entryPoint07Abi,
  entryPoint07Address,
  formatUserOperation,
  formatUserOperationRequest,
  toPackedUserOperation,
} from "viem/account-abstraction";
import { getRpcMethod } from "../common";
import { ConnectedClient } from "../../../common";
import { estimateContractGas, getCode, simulateContract } from "viem/actions";
import { getAction } from "viem/utils";

// TODO: revisit after demo (don't hardcode gas)
const userOpGas = {
  callGasLimit: 20_000_000n,
  preVerificationGas: 200_000n,
  verificationGasLimit: 2_000_000n,
  paymasterVerificationGasLimit: 200_000n,
  paymasterPostOpGasLimit: 200_000n,
} as const;

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

export async function estimateUserOperationGas({
  executor,
  rpcUserOp,
}: {
  executor: ConnectedClient;
  rpcUserOp: RpcUserOperation<"0.7">;
}): Promise<rpcMethod["ReturnType"]> {
  const userOp = formatUserOperation(rpcUserOp);
  // console.log("user op", userOp);
  const packedUserOp = toPackedUserOperation(userOp);

  // TODO: figure out how to decode `handleOps` errors
  // try {
  //   await getAction(
  //     executor,
  //     estimateContractGas,
  //     "estimateContractGas",
  //   )({
  //     abi: entryPoint07Abi,
  //     address: entryPoint07Address,
  //     // address: "0xBbe8A301FbDb2a4CD58c4A37c262ecef8f889c47",
  //     functionName: "handleOps",
  //     args: [[packedUserOp], executor.account.address],
  //     account: executor.account,
  //   });
  // } catch (error) {
  //   console.log("estimate user op gas error", { error });
  // }

  // try {
  //   await getAction(
  //     executor,
  //     simulateContract,
  //     "simulateContract",
  //   )({
  //     abi: entryPoint07Abi,
  //     address: entryPoint07Address,
  //     functionName: "handleOps",
  //     args: [[packedUserOp], executor.account.address],
  //     account: executor.account,
  //   });
  // } catch (error) {
  //   console.log("simulate user op error", { error });
  // }

  // try {
  //   await getAction(
  //     executor,
  //     simulateContract,
  //     "simulateContract",
  //   )({
  //     abi: entrypointSimulationsAbi,
  //     address: "0xBbe8A301FbDb2a4CD58c4A37c262ecef8f889c47",
  //     functionName: "simulateHandleOp",
  //     args: [packedUserOp],
  //     account: executor.account,
  //   });
  // } catch (error) {
  //   console.log("simulate user op error", { error });
  // }

  return formatUserOperationRequest(userOpGas);
}

const entrypointSimulationsAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "_accountValidation",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "outOpInfo",
        type: "tuple",
        internalType: "struct EntryPoint.UserOpInfo",
        components: [
          {
            name: "mUserOp",
            type: "tuple",
            internalType: "struct EntryPoint.MemoryUserOp",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "verificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "callGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterVerificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterPostOpGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymaster",
                type: "address",
                internalType: "address",
              },
              {
                name: "maxFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "userOpHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "prefund",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "contextOffset",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "validationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterValidationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterVerificationGasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_paymasterValidation",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "outOpInfo",
        type: "tuple",
        internalType: "struct EntryPoint.UserOpInfo",
        components: [
          {
            name: "mUserOp",
            type: "tuple",
            internalType: "struct EntryPoint.MemoryUserOp",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "verificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "callGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterVerificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterPostOpGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymaster",
                type: "address",
                internalType: "address",
              },
              {
                name: "maxFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "userOpHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "prefund",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "contextOffset",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "validationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterValidationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterVerificationGasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "_validatePrepayment",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "outOpInfo",
        type: "tuple",
        internalType: "struct EntryPoint.UserOpInfo",
        components: [
          {
            name: "mUserOp",
            type: "tuple",
            internalType: "struct EntryPoint.MemoryUserOp",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "verificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "callGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterVerificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterPostOpGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymaster",
                type: "address",
                internalType: "address",
              },
              {
                name: "maxFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "userOpHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "prefund",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "contextOffset",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "validationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterValidationData",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterVerificationGasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addStake",
    inputs: [
      {
        name: "unstakeDelaySec",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "binarySearchCallGasLimit",
    inputs: [
      {
        name: "queuedUserOps",
        type: "tuple[]",
        internalType: "struct SimulationArgs[]",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "targetUserOp",
        type: "tuple",
        internalType: "struct SimulationArgs",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "entryPoint",
        type: "address",
        internalType: "address",
      },
      {
        name: "initialMinGas",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "toleranceDelta",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "gasAllowance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.TargetCallResult",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "binarySearchPaymasterVerificationGasLimit",
    inputs: [
      {
        name: "queuedUserOps",
        type: "tuple[]",
        internalType: "struct SimulationArgs[]",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "targetUserOp",
        type: "tuple",
        internalType: "struct SimulationArgs",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "entryPoint",
        type: "address",
        internalType: "address",
      },
      {
        name: "initialMinGas",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "toleranceDelta",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "gasAllowance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.TargetCallResult",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "binarySearchVerificationGasLimit",
    inputs: [
      {
        name: "queuedUserOps",
        type: "tuple[]",
        internalType: "struct SimulationArgs[]",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "targetUserOp",
        type: "tuple",
        internalType: "struct SimulationArgs",
        components: [
          {
            name: "op",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "initCode",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "accountGasLimits",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "gasFees",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "paymasterAndData",
                type: "bytes",
                internalType: "bytes",
              },
              {
                name: "signature",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "targetCallData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "entryPoint",
        type: "address",
        internalType: "address",
      },
      {
        name: "initialMinGas",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "toleranceDelta",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "gasAllowance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.TargetCallResult",
        components: [
          {
            name: "gasUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "success",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "returnData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositTo",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "deposits",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "deposit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "staked",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "stake",
        type: "uint112",
        internalType: "uint112",
      },
      {
        name: "unstakeDelaySec",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "withdrawTime",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDepositInfo",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "info",
        type: "tuple",
        internalType: "struct IStakeManager.DepositInfo",
        components: [
          {
            name: "deposit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "staked",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "stake",
            type: "uint112",
            internalType: "uint112",
          },
          {
            name: "unstakeDelaySec",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "withdrawTime",
            type: "uint48",
            internalType: "uint48",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "key",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserOpHash",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "incrementNonce",
    inputs: [
      {
        name: "key",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "innerHandleOp",
    inputs: [
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "opInfo",
        type: "tuple",
        internalType: "struct EntryPoint.UserOpInfo",
        components: [
          {
            name: "mUserOp",
            type: "tuple",
            internalType: "struct EntryPoint.MemoryUserOp",
            components: [
              {
                name: "sender",
                type: "address",
                internalType: "address",
              },
              {
                name: "nonce",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "verificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "callGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterVerificationGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterPostOpGasLimit",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "preVerificationGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymaster",
                type: "address",
                internalType: "address",
              },
              {
                name: "maxFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "userOpHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "prefund",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "contextOffset",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "context",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "preGas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "actualGasCost",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "paymasterPostOpGasLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nonceSequenceNumber",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "simulateCall",
    inputs: [
      {
        name: "entryPoint",
        type: "address",
        internalType: "address",
      },
      {
        name: "payload",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "gas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "success",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateCallAndRevert",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "gas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOp",
    inputs: [
      {
        name: "op",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ExecutionResult",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOpBulk",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEntryPointSimulations.ExecutionResult[]",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateHandleOpLast",
    inputs: [
      {
        name: "ops",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ExecutionResult",
        components: [
          {
            name: "preOpGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accountValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterValidationData",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterVerificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterPostOpGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "targetSuccess",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "targetResult",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidation",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ValidationResult",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidationBulk",
    inputs: [
      {
        name: "userOps",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct IEntryPointSimulations.ValidationResult[]",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "simulateValidationLast",
    inputs: [
      {
        name: "userOps",
        type: "tuple[]",
        internalType: "struct PackedUserOperation[]",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct IEntryPointSimulations.ValidationResult",
        components: [
          {
            name: "returnInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.ReturnInfo",
            components: [
              {
                name: "preOpGas",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "prefund",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "accountValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterValidationData",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "paymasterContext",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
          {
            name: "senderInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "factoryInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "paymasterInfo",
            type: "tuple",
            internalType: "struct IStakeManager.StakeInfo",
            components: [
              {
                name: "stake",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "unstakeDelaySec",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "aggregatorInfo",
            type: "tuple",
            internalType: "struct IEntryPoint.AggregatorStakeInfo",
            components: [
              {
                name: "aggregator",
                type: "address",
                internalType: "address",
              },
              {
                name: "stakeInfo",
                type: "tuple",
                internalType: "struct IStakeManager.StakeInfo",
                components: [
                  {
                    name: "stake",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "unstakeDelaySec",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unlockStake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawStake",
    inputs: [
      {
        name: "withdrawAddress",
        type: "address",
        internalType: "address payable",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawTo",
    inputs: [
      {
        name: "withdrawAddress",
        type: "address",
        internalType: "address payable",
      },
      {
        name: "withdrawAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AccountDeployed",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "factory",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "paymaster",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BeforeExecution",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalDeposit",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PostOpRevertReason",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "revertReason",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SignatureAggregatorChanged",
    inputs: [
      {
        name: "aggregator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeLocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalStaked",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "unstakeDelaySec",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeUnlocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawTime",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StakeWithdrawn",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationEvent",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "paymaster",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "success",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "actualGasCost",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "actualGasUsed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationPrefundTooLow",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UserOperationRevertReason",
    inputs: [
      {
        name: "userOpHash",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "nonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "revertReason",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "withdrawAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "FailedOp",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        internalType: "string",
      },
    ],
  },
  {
    type: "error",
    name: "FailedOpWithRevert",
    inputs: [
      {
        name: "opIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "reason",
        type: "string",
        internalType: "string",
      },
      {
        name: "inner",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "PostOpReverted",
    inputs: [
      {
        name: "returnData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "SenderAddressResult",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SignatureValidationFailed",
    inputs: [
      {
        name: "aggregator",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SimulationOutOfGas",
    inputs: [
      {
        name: "optimalGas",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "minGas",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxGas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "innerCallResult",
    inputs: [
      {
        name: "remainingGas",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
] as const;
