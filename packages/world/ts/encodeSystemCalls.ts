import { Abi, encodeFunctionData, type ContractFunctionName } from "viem";
import { SystemCall } from "./encodeSystemCall";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";
import { internal_normalizeSystemFunctionName } from "./normalizeSystemFunctionName";

export type SystemCalls<abis extends readonly Abi[]> = {
  [k in keyof abis]: SystemCall<abis[k], ContractFunctionName<abis[k]>>;
};

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abis extends readonly Abi[]>(
  systemCalls: SystemCalls<abis>,
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "batchCall">["inputs"]> {
  return [
    systemCalls.map(({ abi, systemId, functionName, args }) => ({
      systemId,
      callData: encodeFunctionData({
        abi,
        functionName: internal_normalizeSystemFunctionName(systemId, functionName),
        args,
      }),
    })),
  ];
}
