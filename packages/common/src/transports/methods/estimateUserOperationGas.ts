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
import { entryPointGasSimulationsAbi, entryPointSimulationsDeployedBytecode } from "../entryPointGasSimulations";

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

type EstimateUserOperationGasOptions = {
  request: EIP1193RequestFn;
  params: rpcMethod["Parameters"];
};

export async function estimateUserOperationGas({
  request,
  params,
}: EstimateUserOperationGasOptions): Promise<rpcMethod["ReturnType"]> {
  const userOp = formatUserOperation(params[0]);
  const gasSimulation = await simulateGas({ userOp, request });
  const gasLimits = {
    verificationGasLimit: gasSimulation.verificationGas * 2n,
    callGasLimit: bigIntMax(gasSimulation.callGas * 2n, 9000n),
    paymasterVerificationGasLimit: gasSimulation.paymasterVerificationGas * 2n,
    paymasterPostOpGasLimit: gasSimulation.paymasterPostOpGas * 2n,
    preVerificationGas: 10_000_000n, // TODO: change this based on our alto config
  };

  return formatUserOperationRequest({
    ...gasLimits,
  });
}

type SimulateGasOptions = {
  request: EIP1193RequestFn;
  userOp: UserOperation<"0.7">;
};

type SimulateGasResult = DecodeFunctionResultReturnType<typeof entryPointGasSimulationsAbi>;

async function simulateGas({ request, userOp }: SimulateGasOptions): Promise<SimulateGasResult> {
  // Prepare user operation for simulation
  const simulationUserOp = {
    ...userOp,
    preVerificationGas: 0n,
    callGasLimit: 10_000_000n,
    verificationGasLimit: 10_000_000n,
    // https://github.com/pimlicolabs/alto/blob/471998695e5ec75ef88dda3f8a534f47c24bcd1a/src/rpc/methods/eth_estimateUserOperationGas.ts#L117
    maxPriorityFeePerGas: userOp.maxFeePerGas,
    paymasterPostOpGasLimit: 2_000_000n,
    paymasterVerificationGasLimit: 5_000_000n,
  } satisfies UserOperation<"0.7">;

  const packedUserOp = toPackedUserOperation(simulationUserOp);
  const simulationData = encodeFunctionData({
    abi: entryPointGasSimulationsAbi,
    functionName: "estimateGas",
    args: [packedUserOp],
  });

  const hasPaymaster = userOp.paymaster != null && userOp.paymaster !== zeroAddress;
  const senderBalanceOverride = hasPaymaster ? {} : { [userOp.sender]: { balance: "0xFFFFFFFFFFFFFFFFFFFF" } };
  const simulationParams = [
    {
      to: entryPoint07Address,
      data: simulationData,
    },
    "pending",
    {
      [entryPoint07Address]: { code: entryPointSimulationsDeployedBytecode },
      ...senderBalanceOverride,
    },
  ];
  const encodedSimulationResult: Hex = await request({
    method: "eth_call",
    params: simulationParams,
  });

  return decodeFunctionResult({
    abi: entryPointGasSimulationsAbi,
    functionName: "estimateGas",
    data: encodedSimulationResult,
  });
}
