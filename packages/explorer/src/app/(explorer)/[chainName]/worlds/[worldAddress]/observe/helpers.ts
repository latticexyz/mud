import { Address, Hex, Transaction, decodeFunctionData } from "viem";
import { doomWorldAbi } from "./abis";

export function getCalls(decodedFunctionName: string, decodedArgs: readonly unknown[], transaction: Transaction) {
  if (decodedFunctionName === "execute") {
    const target = decodedArgs[0] as Address;
    // const value = decodedArgs[1]; // TODO: handle value
    const data = decodedArgs[2] as Hex;

    return getCall(target, data, transaction);
  } else if (decodedFunctionName === "executeBatch") {
    return (decodedArgs[0] as { target: Address; data: Hex }[]).map((worldFunction) =>
      getCall(worldFunction.target, worldFunction.data, transaction),
    );
  }
  return [];
}

function getCall(target: Address, data: Hex, transaction: Transaction) {
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
  };
}
