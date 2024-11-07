import { BundlerRpcSchema } from "viem";
import { formatUserOperationRequest } from "viem/account-abstraction";
import { getRpcMethod } from "../common";

// TODO: revisit after demo (don't hardcode gas)

type rpcMethod = getRpcMethod<BundlerRpcSchema, "eth_estimateUserOperationGas">;

export async function estimateUserOperationGas(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _params: rpcMethod["Parameters"],
): Promise<rpcMethod["ReturnType"]> {
  return formatUserOperationRequest({
    callGasLimit: 50_000_000n,
    preVerificationGas: 100_000n,
    verificationGasLimit: 1_000_000n,
    paymasterVerificationGasLimit: 100_000n,
    paymasterPostOpGasLimit: 100_000n,
  });
}
