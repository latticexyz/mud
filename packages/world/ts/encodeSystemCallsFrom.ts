import { Abi, Address, encodeFunctionData } from "viem";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";
import { internal_normalizeSystemFunctionName } from "./normalizeSystemFunctionName";
import { SystemCalls } from "./encodeSystemCalls";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abis extends readonly Abi[]>(
  from: Address,
  systemCalls: SystemCalls<abis>,
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "batchCallFrom">["inputs"]> {
  return [
    systemCalls.map(({ abi, systemId, functionName, args }) => ({
      from,
      systemId,
      callData: encodeFunctionData({
        abi,
        functionName: internal_normalizeSystemFunctionName(systemId, functionName),
        args,
      }),
    })),
  ];
}
