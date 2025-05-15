import {
  BundlerRpcSchema,
  decodeFunctionResult,
  DecodeFunctionResultReturnType,
  EIP1193RequestFn,
  encodeFunctionData,
  Hex,
  zeroAddress,
} from "viem";
import { getRpcMethod } from "../common";
import {
  entryPoint07Address,
  formatUserOperation,
  formatUserOperationRequest,
  toPackedUserOperation,
  UserOperation,
} from "viem/account-abstraction";
import entryPointSimulationsArtifact from "@account-abstraction/contracts/artifacts/EntryPointSimulations.json" assert { type: "json" };
import { bigIntMax, bigIntScalePercent } from "../../utils";

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

type EstimateUserOperationGasOptions = {
  request: EIP1193RequestFn;
  params: rpcMethod["Parameters"];
};

type SimulationResult = DecodeFunctionResultReturnType<[typeof simulateHandleOpAbiItem]>;

// TODO: handle calculating paymaster gas limits
// TODO: handle calculating gas limits without paymaster

export async function estimateUserOperationGas({
  request,
  params,
}: EstimateUserOperationGasOptions): Promise<rpcMethod["ReturnType"]> {
  console.log("estimating user operation gas", { request, params });

  const userOp = formatUserOperation(params[0]);

  // // Prepare user operation for simulation
  // const rpcUserOp: RpcUserOperation<"0.7"> = {
  //   ...params[0],
  //   preVerificationGas: "0x00",
  //   callGasLimit: "0x989680", // 10_000_000
  //   verificationGasLimit: "0x989680", // 10_000_000
  //   paymasterPostOpGasLimit: "0x1e8480", // 2_000_000
  //   paymasterVerificationGasLimit: "0x4c4b40", // 5_000_000
  //   // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L117
  //   maxPriorityFeePerGas: params[0].maxFeePerGas,
  // };

  // const packedUserOp = toPackedUserOperation(userOp);
  // console.log("packedUserOp", packedUserOp);

  // const simulationData = encodeFunctionData({
  //   abi: entryPointSimulationsArtifact.abi,
  //   functionName: "simulateHandleOp",
  //   args: [packedUserOp, zeroAddress, "0x"],
  // });

  // const simulationParams = [
  //   {
  //     to: entryPoint07Address,
  //     data: simulationData,
  //   },
  //   "latest",
  //   {
  //     [entryPoint07Address]: { code: entryPointSimulationsArtifact.deployedBytecode as Hex },
  //   },
  // ];

  // console.log("simulationParams", simulationParams);

  // // use eth_call to call entrypoint simulation contract to estimate gas instead
  // const encodedSimulationResult: Hex = await request({
  //   method: "eth_call",
  //   params: simulationParams,
  // });

  // const simulationResult = decodeFunctionResult({
  //   abi: [simulateHandleOpAbiItem],
  //   functionName: "simulateHandleOp",
  //   data: encodedSimulationResult,
  // });

  // console.log("simulationResult", simulationResult);

  // const {
  //   paymaster,
  //   paymasterData,
  //   paymasterPostOpGasLimit,
  //   paymasterVerificationGasLimit,
  //   ...userOpWithoutPaymaster
  // } = userOp;
  // const packedUserOpWithoutPaymaster = toPackedUserOperation(userOpWithoutPaymaster);
  // const simulationWithoutPaymasterData = encodeFunctionData({
  //   abi: entryPointSimulationsArtifact.abi,
  //   functionName: "simulateHandleOp",
  //   args: [packedUserOpWithoutPaymaster, zeroAddress, "0x"],
  // });

  // const simulationWithoutPaymasterParams = [
  //   {
  //     to: entryPoint07Address,
  //     data: simulationWithoutPaymasterData,
  //   },
  //   "latest",
  //   {
  //     [userOp.sender]: {
  //       balance: "0xFFFFFFFFFFFFFFFFFFFF",
  //     },
  //     [entryPoint07Address]: { code: entryPointSimulationsArtifact.deployedBytecode as Hex },
  //   },
  // ];

  // const encodedSimulationWithoutPaymasterResult: Hex = await request({
  //   method: "eth_call",
  //   params: simulationWithoutPaymasterParams,
  // });

  // const simulationWithoutPaymasterResult = decodeFunctionResult({
  //   abi: [simulateHandleOpAbiItem],
  //   functionName: "simulateHandleOp",
  //   data: encodedSimulationWithoutPaymasterResult,
  // });

  // console.log("simulationResult without paymaster", simulationWithoutPaymasterResult);

  const hasPaymaster = userOp.paymaster != null && userOp.paymaster !== zeroAddress;

  const [simulationResult, simulationResultWithPaymaster] = await Promise.all([
    simulateHandleOp({ userOp, removePaymaster: hasPaymaster, request }),
    hasPaymaster ? simulateHandleOp({ userOp, request }) : undefined,
  ]);

  const gasEstimates = getGasEstimates({ userOp, simulationResult, simulationResultWithPaymaster });

  console.log("simulationResults", { simulationResult, simulationResultWithPaymaster });

  // const gasEstimates = formatUserOperationRequest({
  //   preVerificationGas: 0n, // The wiresaw bundler doesn't require preVerificationGas
  //   callGasLimit,
  //   verificationGasLimit,
  //   paymasterVerificationGasLimit: 200_000n,
  //   paymasterPostOpGasLimit: 200_000n,
  // });

  console.log("client gasEstimates", gasEstimates);

  return formatUserOperationRequest({
    ...gasEstimates,
  });
}

type SimulateHandleOpOptions = {
  request: EIP1193RequestFn;
  userOp: UserOperation<"0.7">;
  removePaymaster?: boolean;
};

async function simulateHandleOp({
  userOp,
  removePaymaster,
  request,
}: SimulateHandleOpOptions): Promise<SimulationResult> {
  if (removePaymaster) {
    /* eslint-disable */
    const {
      paymaster,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
      ...userOpWithoutPaymaster
    } = userOp;
    userOp = userOpWithoutPaymaster;
    /* eslint-enable */
  }

  // Prepare user operation for simulation
  const simulationUserOp = {
    ...userOp,
    preVerificationGas: 0n,
    callGasLimit: 10_000_000n,
    verificationGasLimit: 10_000_000n,
    // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L117
    maxPriorityFeePerGas: userOp.maxFeePerGas,
    ...(userOp.paymaster && !removePaymaster
      ? {
          paymasterPostOpGasLimit: 2_000_000n,
          paymasterVerificationGasLimit: 5_000_000n,
        }
      : {}),
  } satisfies UserOperation<"0.7">;

  const packedUserOp = toPackedUserOperation(simulationUserOp);
  const simulationData = encodeFunctionData({
    abi: entryPointSimulationsArtifact.abi,
    functionName: "simulateHandleOp",
    args: [packedUserOp, zeroAddress, "0x"],
  });

  const simulationParams = [
    {
      to: entryPoint07Address,
      data: simulationData,
    },
    "pending",
    {
      [entryPoint07Address]: { code: entryPointSimulationsArtifact.deployedBytecode as Hex },
      ...(removePaymaster
        ? {
            [userOp.sender]: { balance: "0xFFFFFFFFFFFFFFFFFFFF" },
          }
        : {}),
    },
  ];

  const encodedSimulationResult: Hex = await request({
    method: "eth_call",
    params: simulationParams,
  });

  return decodeFunctionResult({
    abi: [simulateHandleOpAbiItem],
    functionName: "simulateHandleOp",
    data: encodedSimulationResult,
  });
}

type GetGasEstimatesOptions = {
  userOp: UserOperation<"0.7">;
  simulationResult: SimulationResult;
  simulationResultWithPaymaster?: SimulationResult;
};

type GasEstimates = {
  verificationGasLimit: bigint;
  callGasLimit: bigint;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
  preVerificationGas: bigint;
};

function getGasEstimates({
  userOp,
  simulationResult,
  simulationResultWithPaymaster,
}: GetGasEstimatesOptions): GasEstimates {
  const hasPaymaster = simulationResultWithPaymaster != null;

  const verificationGas = simulationResult.preOpGas;
  const callGas = simulationResult.paid / userOp.maxFeePerGas - simulationResult.preOpGas;
  const paymasterVerificationGas = hasPaymaster
    ? simulationResultWithPaymaster.preOpGas - simulationResult.preOpGas
    : 0n;
  const paymasterPostOpGas = hasPaymaster
    ? simulationResultWithPaymaster.paid / userOp.maxFeePerGas - simulationResultWithPaymaster.preOpGas - callGas
    : 0n;

  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L45
  const verificationGasLimit = bigIntScalePercent(verificationGas, 150);
  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L52
  const callGasLimit = bigIntMax(bigIntScalePercent(callGas, 150), 9000n);
  const paymasterVerificationGasLimit = bigIntScalePercent(paymasterVerificationGas, 150);
  const paymasterPostOpGasLimit = bigIntScalePercent(paymasterPostOpGas, 150);

  return {
    verificationGasLimit,
    callGasLimit,
    paymasterVerificationGasLimit,
    paymasterPostOpGasLimit,
    preVerificationGas: 0n,
  };
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
