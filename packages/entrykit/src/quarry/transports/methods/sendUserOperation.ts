import { RpcUserOperation, RpcUserOperationReceipt, parseEventLogs } from "viem";
import {
  formatUserOperation,
  toPackedUserOperation,
  getUserOperationHash,
  entryPoint07Address,
  entryPoint07Abi,
} from "viem/account-abstraction";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { ConnectedClient } from "../../../common";

// TODO: move to common package?

export async function sendUserOperation({
  executor,
  rpcUserOp,
}: {
  executor: ConnectedClient;
  rpcUserOp: RpcUserOperation<"0.7">;
}): Promise<
  Pick<RpcUserOperationReceipt<"0.7">, "success" | "userOpHash"> & {
    receipt: Pick<RpcUserOperationReceipt<"0.7">["receipt"], "transactionHash">;
  }
> {
  const userOp = formatUserOperation(rpcUserOp);
  const packedUserOp = toPackedUserOperation(userOp);

  const userOpHash = getUserOperationHash({
    userOperation: userOp,
    chainId: executor.chain.id,
    entryPointVersion: "0.7",
    entryPointAddress: entryPoint07Address,
  });

  const transactionHash = await getAction(
    executor,
    writeContract,
    "writeContract",
  )({
    abi: entryPoint07Abi,
    address: entryPoint07Address,
    functionName: "handleOps",
    args: [[packedUserOp], executor.account.address],
    chain: executor.chain,
    account: executor.account,
  });

  const receipt = await getAction(
    executor,
    waitForTransactionReceipt,
    "waitForTransactionReceipt",
  )({ hash: transactionHash });

  // TODO: replace with `getUserOperationReceipt`?
  const parsedLogs = parseEventLogs({
    logs: receipt.logs,
    abi: entryPoint07Abi,
    eventName: "UserOperationEvent" as const,
  });

  return {
    success: parsedLogs[0]!.args.success,
    userOpHash,
    receipt,
  };
}
