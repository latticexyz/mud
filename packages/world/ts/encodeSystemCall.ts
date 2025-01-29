import { Abi, EncodeFunctionDataParameters, Hex, encodeFunctionData, type ContractFunctionName } from "viem";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";
import { internal_normalizeSystemFunctionName } from "./normalizeSystemFunctionName";

export type SystemCall<abi extends Abi, functionName extends ContractFunctionName<abi>> = {
  /**
   * System ABI
   */
  readonly abi: abi;
  /**
   * System's resource ID
   */
  readonly systemId: Hex;
  /**
   * System function name to call
   */
  readonly functionName: functionName;
} & Pick<EncodeFunctionDataParameters<abi, functionName>, "args">;

/** Encode a system call to be passed as arguments into `World.call` */
export function encodeSystemCall<abi extends Abi, functionName extends ContractFunctionName<abi>>({
  abi,
  systemId,
  functionName,
  args,
}: SystemCall<abi, functionName>): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "call">["inputs"]> {
  return [
    systemId,
    encodeFunctionData<abi, functionName>({
      abi,
      functionName: internal_normalizeSystemFunctionName(systemId, functionName),
      args,
    } as EncodeFunctionDataParameters<abi, functionName>),
  ];
}
