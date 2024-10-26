import { Transaction, decodeFunctionData, getAbiItem } from "viem";
import { formatAbiItem } from "viem/utils";
import { doomWorldAbi } from "./abis";

export function getCalls(decodedFunctionName: string, decodedArgs: readonly unknown[], transaction: Transaction) {
  if (decodedFunctionName === "execute") {
    const target = decodedArgs[0] as string;
    // const value = decodedArgs[1]; // TODO: handle value
    const data = decodedArgs[2] as string;

    return getCall(target, data, transaction);
  } else if (decodedFunctionName === "executeBatch") {
    return (decodedArgs[0] as { target: string; data: string }[]).map((worldFunction) =>
      getCall(worldFunction.target, worldFunction.data, transaction),
    );
  }
  return [];
}

function getCall(target: string, data: string, transaction: Transaction) {
  let functionName: string | undefined;
  let args: readonly unknown[] | undefined;
  try {
    const functionData = decodeFunctionData({ abi: doomWorldAbi, data });
    functionName = functionData.functionName;
    args = functionData.args;
  } catch (error) {
    functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
  }

  const functionAbiItem = getAbiItem({
    abi: doomWorldAbi,
    name: functionName,
    args,
  } as never);

  return {
    to: target,
    functionSignature: functionAbiItem ? formatAbiItem(functionAbiItem) : "unknown",
    functionName,
    args,
  };
}
