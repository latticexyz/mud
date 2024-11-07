import { Abi, Address, Hex, decodeFunctionData } from "viem";
import { DecodedUserOperationCall } from "../useMergedTransactions";

export function getDecodedUserOperationCalls({
  abi,
  functionName,
  decodedArgs,
}: {
  abi: Abi;
  functionName: string;
  decodedArgs: readonly unknown[];
}) {
  if (functionName === "execute") {
    const target = decodedArgs[0] as Address;
    const value = decodedArgs[1] as bigint;
    const data = decodedArgs[2] as Hex;
    return [getDecodedUserOperationCall({ abi, target, data, value })];
  } else if (functionName === "executeBatch") {
    return (decodedArgs[0] as { target: Address; data: Hex; value: bigint }[]).map(({ target, data, value }) =>
      getDecodedUserOperationCall({ abi, target, data, value }),
    );
  }
  return [];
}

function getDecodedUserOperationCall({
  abi,
  target,
  data,
  value,
}: {
  abi: Abi;
  target: Address;
  data: Hex;
  value: bigint;
}): DecodedUserOperationCall {
  let functionName: string | undefined;
  let args: readonly unknown[] | undefined;
  let from: Address | undefined;

  try {
    const functionData = decodeFunctionData({ abi, data: data });
    functionName = functionData.functionName;
    args = functionData.args;

    if (functionName === "callFrom") {
      const [delegator, , data] = args as [Address, Hex, Hex];
      const decodedCallData = decodeFunctionData({ abi, data });
      functionName = decodedCallData.functionName;
      args = decodedCallData.args;
      from = delegator;
    }
  } catch (error) {
    functionName = data.length > 10 ? data.slice(0, 10) : "unknown";
  }

  return {
    to: target,
    from,
    functionName,
    args,
    value,
  };
}
