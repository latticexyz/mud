import { decodeFunctionData, AbiFunctionSignatureNotFoundError, type Hex } from "viem";
import { type ContractWrite } from "@latticexyz/common";
import { useDevToolsContext } from "../DevToolsContext";
import { WriteFunctionNameAndArgs } from "./WriteFunctionNameAndArgs";
import { WriteFunction as WriteFunctionZustand } from "../zustand/WriteFunction";

type Props = {
  write: ContractWrite;
};

// Displays the function name and arguments of `write` (e.g., 'addTask("something")').
export function WriteFunction({ write }: Props) {
  const { worldAbi, useStore } = useDevToolsContext();

  const worldFunctionName = write.request.functionName;
  const worldFunctionArgs = write.request.args;

  // Just use the World function if it's not `call`/`callFrom`.
  if (worldFunctionName !== "call" && worldFunctionName !== "callFrom") {
    return <WriteFunctionNameAndArgs name={worldFunctionName} args={worldFunctionArgs} />;
  }

  const systemFunctionCalldata = worldFunctionArgs![worldFunctionArgs!.length - 1] as Hex;

  // Decode the calldata properly if the client store is available.
  if (useStore) {
    return (
      <WriteFunctionZustand worldFunctionName={worldFunctionName} systemFunctionCalldata={systemFunctionCalldata} />
    );
  }

  // Try using the World ABI to decode `systemFunctionCalldata`.
  // Since the calldata corresponds to a System's function, this may not be successful.
  // For instance, non-root System calls could result in an error.
  try {
    const functionData = decodeFunctionData({ abi: worldAbi, data: systemFunctionCalldata });

    return (
      <WriteFunctionNameAndArgs name={functionData.functionName} args={functionData.args} viaName={worldFunctionName} />
    );
  } catch (error) {
    if (!(error instanceof AbiFunctionSignatureNotFoundError)) {
      throw error;
    }
  }

  // Fallback that uses the World function (e.g., "callFrom(args)").
  return <WriteFunctionNameAndArgs name={worldFunctionName} args={worldFunctionArgs} />;
}
