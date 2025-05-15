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
import { bigIntMax } from "../../utils";
import { entryPointSimulationsAbi, entryPointSimulationsDeployedBytecode } from "../entryPointSimulations";

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

type EstimateUserOperationGasOptions = {
  request: EIP1193RequestFn;
  params: rpcMethod["Parameters"];
};

type SimulationResult = DecodeFunctionResultReturnType<typeof entryPointSimulationsAbi>;

export async function estimateUserOperationGas({
  request,
  params,
}: EstimateUserOperationGasOptions): Promise<rpcMethod["ReturnType"]> {
  console.log("estimating user operation gas", { request, params });

  const userOp = formatUserOperation(params[0]);

  const hasPaymaster = userOp.paymaster != null && userOp.paymaster !== zeroAddress;

  const [simulationResult, simulationResultWithPaymaster] = await Promise.all([
    simulateHandleOp({ userOp, removePaymaster: hasPaymaster, request }),
    hasPaymaster ? simulateHandleOp({ userOp, request }) : undefined,
  ]);

  const gasEstimates = getGasEstimates({ userOp, simulationResult, simulationResultWithPaymaster });

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
    const {
      /* eslint-disable */
      paymaster,
      paymasterData,
      paymasterPostOpGasLimit,
      paymasterVerificationGasLimit,
      /* eslint-enable */
      ...userOpWithoutPaymaster
    } = userOp;
    userOp = userOpWithoutPaymaster;
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
    abi: entryPointSimulationsAbi,
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
      [entryPoint07Address]: { code: entryPointSimulationsDeployedBytecode },
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
    abi: entryPointSimulationsAbi,
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

  const verificationGas = hasPaymaster ? simulationResultWithPaymaster.preOpGas : simulationResult.preOpGas;
  const paymasterVerificationGas = hasPaymaster
    ? simulationResultWithPaymaster.preOpGas - simulationResult.preOpGas
    : 0n;
  const callGas = simulationResult.paid / userOp.maxFeePerGas - simulationResult.preOpGas;
  const paymasterPostOpGas = hasPaymaster
    ? simulationResultWithPaymaster.paid / userOp.maxFeePerGas - simulationResultWithPaymaster.preOpGas - callGas
    : 0n;

  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L45
  const verificationGasLimit = verificationGas * 2n;
  // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L52
  const callGasLimit = bigIntMax(callGas * 2n, 9000n);
  const paymasterVerificationGasLimit = paymasterVerificationGas * 2n;
  const paymasterPostOpGasLimit = paymasterPostOpGas * 2n;

  return {
    verificationGasLimit,
    callGasLimit,
    paymasterVerificationGasLimit,
    paymasterPostOpGasLimit,
    preVerificationGas: 20_000n,
  };
}
