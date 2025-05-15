import { BundlerRpcSchema, EIP1193RequestFn, encodeFunctionData, Hex, RpcUserOperation, zeroAddress } from "viem";
import { getRpcMethod } from "../common";
import { entryPoint07Address, formatUserOperation, toPackedUserOperation } from "viem/account-abstraction";
import entryPointSimulationsArtifact from "@account-abstraction/contracts/artifacts/EntryPointSimulations.json" assert { type: "json" };

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

  // console.log("userOp", userOp);
  const gasOverrides = {
    callGasLimit: "0x24821",
    maxFeePerGas: "0x186dc",
    maxPriorityFeePerGas: "0x186a0",
    preVerificationGas: "0xd4b6",
    verificationGasLimit: "0x27c85",
    paymasterPostOpGasLimit: "0x6aa4",
    paymasterVerificationGasLimit: "0x15372",
  } as const;

  const rpcUserOp: RpcUserOperation<"0.7"> = { ...params[0], ...gasOverrides };
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
  const simulationResult = await request({
    method: "eth_call",
    params: simulationParams,
  });
  console.log("simulationResult", simulationResult);

  // const handleOpsData = encodeFunctionData({
  //   abi: entryPoint07SimulationsAbi,
  //   functionName: "simulateHandleOp",
  //   args: [packedUserOp, zeroAddress, "0x"],
  // });

  // const handleOpsParams = [
  //   {
  //     to: entryPointSimulations07Address,
  //     data: handleOpsData,
  //     from: zeroAddress,
  //   },
  //   "latest",
  //   { [params[0].sender]: { balance: "0xFFFFFFFFFFFFFFFFFFFF" }, [zeroAddress]: { balance: "0xFFFFFFFFFFFFFFFFFFFF" } },
  // ];

  // use eth_call to call entrypoint simulation contract to simulate handle ops
  // const handleOpsResult = await request({
  //   method: "eth_call",
  //   params: handleOpsParams,
  // });

  // console.log("handleOpsResult", handleOpsResult);

  throw new Error("not implemented");
}
