import { Address, Hex, Transaction, decodeFunctionData } from "viem";
import { DecodedUserOperationCall } from "../../../../../../observer/messages";
import { doomWorldAbi } from "./abis";

export function getDecodedUserOperationCalls({
  functionName,
  decodedArgs,
  transaction,
}: {
  functionName: string;
  decodedArgs: readonly unknown[];
  transaction: Transaction;
}) {
  if (functionName === "execute") {
    const target = decodedArgs[0] as Address;
    const value = decodedArgs[1] as bigint;
    const data = decodedArgs[2] as Hex;

    return [getDecodedUserOperationCall({ target, data, transaction, value })];
  } else if (functionName === "executeBatch") {
    return (decodedArgs[0] as { target: Address; data: Hex; value: bigint }[]).map(({ target, data, value }) =>
      getDecodedUserOperationCall({ target, data, transaction, value }),
    );
  }
  return [];
}

function getDecodedUserOperationCall({
  target,
  data,
  transaction,
  value,
}: {
  target: Address;
  data: Hex;
  transaction: Transaction;
  value: bigint;
}): DecodedUserOperationCall {
  let functionName: string | undefined;
  let args: readonly unknown[] | undefined;
  try {
    const functionData = decodeFunctionData({ abi: doomWorldAbi, data });
    functionName = functionData.functionName;
    args = functionData.args;
  } catch (error) {
    functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
  }

  return {
    to: target,
    functionName,
    args,
    value,
  };
}
