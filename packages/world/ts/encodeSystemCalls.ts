import { Abi, type ContractFunctionName } from "viem";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { worldCallAbi } from "./worldCallAbi";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[],
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<worldCallAbi, "call">["inputs"]>[] {
  return systemCalls.map((systemCall) => encodeSystemCall({ ...systemCall, abi } as SystemCall<abi, functionName>));
}
