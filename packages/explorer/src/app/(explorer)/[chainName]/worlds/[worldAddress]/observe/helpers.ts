import { Abi, Address, Hex, decodeFunctionData } from "viem";
import { DecodedUserOperationCall } from "../../../../../../observer/messages";

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
  value, // TODO: what to do with value?
}: {
  abi: Abi;
  target: Address;
  data: Hex;
  value: bigint;
}): DecodedUserOperationCall {
  let functionName: string | undefined;
  let args: readonly unknown[] | undefined;
  try {
    const functionData = decodeFunctionData({ abi, data: data });
    functionName = functionData.functionName;
    args = functionData.args;
  } catch (error) {
    functionName = data.length > 10 ? data.slice(0, 10) : "unknown";
  }

  return {
    to: target,
    functionName,
    args,
    value,
  };
}
