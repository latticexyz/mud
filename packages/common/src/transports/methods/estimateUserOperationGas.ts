import {
  BundlerRpcSchema,
  decodeFunctionResult,
  EIP1193RequestFn,
  encodeFunctionData,
  Hex,
  RpcUserOperation,
  zeroAddress,
} from "viem";
import { getRpcMethod } from "../common";
import {
  entryPoint07Address,
  formatUserOperation,
  formatUserOperationRequest,
  toPackedUserOperation,
} from "viem/account-abstraction";
import entryPointSimulationsArtifact from "@account-abstraction/contracts/artifacts/EntryPointSimulations.json" assert { type: "json" };
import { bigIntMax, bigIntScalePercent } from "../../utils";

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

type EstimateUserOperationGasOptions = {
  request: EIP1193RequestFn;
  params: rpcMethod["Parameters"];
};

export async function estimateUserOperationGas({
  request,
  params,
}: EstimateUserOperationGasOptions): Promise<rpcMethod["ReturnType"]> {
  console.log("estimating user operation gas", { request, params });

  // Prepare user operation for simulation
  const rpcUserOp: RpcUserOperation<"0.7"> = {
    ...params[0],
    preVerificationGas: "0x00",
    callGasLimit: "0x989680", // 10_000_000
    verificationGasLimit: "0x989680", // 10_000_000
    paymasterPostOpGasLimit: "0x1e8480", // 2_000_000
    paymasterVerificationGasLimit: "0x4c4b40", // 5_000_000
    // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L117
    maxPriorityFeePerGas: params[0].maxFeePerGas,
  };

  const userOp = formatUserOperation(rpcUserOp);
  const packedUserOp = toPackedUserOperation(userOp);
  console.log("packedUserOp", packedUserOp);

  const data = encodeFunctionData({
    abi: entryPointSimulationsArtifact.abi,
    functionName: "simulateHandleOp",
    args: [packedUserOp, zeroAddress, "0x"],
  });

  const simulationParams = [
    {
      // from: userOp.sender,
      to: entryPoint07Address,
      data,
    },
    "latest",
    {
      [userOp.sender]: {
        balance: "0xFFFFFFFFFFFFFFFFFFFF",
      },
      [entryPoint07Address]: { code: entryPointSimulationsArtifact.deployedBytecode as Hex },
    },
  ];

  console.log("simulationParams", simulationParams);

  // use eth_call to call entrypoint simulation contract to estimate gas instead
  const encodedSimulationResult: Hex = await request({
    method: "eth_call",
    params: simulationParams,
  });

  const simulationResult = decodeFunctionResult({
    abi: [simulateHandleOpAbiItem],
    functionName: "simulateHandleOp",
    data: encodedSimulationResult,
  });

  console.log("simulationResult", simulationResult);

  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L45
  const verificationGasLimit = bigIntScalePercent(simulationResult.preOpGas, 150);

  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L52
  const calculatedCallGasLimit = simulationResult.paid / userOp.maxFeePerGas - simulationResult.preOpGas;
  const callGasLimit = bigIntMax(calculatedCallGasLimit, 9000n);

  const gasEstimates = formatUserOperationRequest({
    preVerificationGas: 0n, // The wiresaw bundler doesn't require preVerificationGas
    callGasLimit,
    verificationGasLimit,
    paymasterVerificationGasLimit: 200_000n,
    paymasterPostOpGasLimit: 200_000n,
  });

  console.log("gasEstimates", gasEstimates);

  throw new Error("not implemented");
}

const simulateHandleOpAbiItem = {
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
} as const;
