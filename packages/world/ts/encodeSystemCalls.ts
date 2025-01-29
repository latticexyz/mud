import { Abi, EncodeFunctionDataParameters, encodeFunctionData, type ContractFunctionName } from "viem";
import { SystemCall } from "./encodeSystemCall";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[],
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "batchCall">["inputs"]> {
  return [
    systemCalls.map(({ systemId, functionName, args }) => ({
      systemId,
      callData: encodeFunctionData<abi, functionName>({
        abi,
        functionName,
        args,
      } as EncodeFunctionDataParameters<abi, functionName>),
    })),
  ];
}
