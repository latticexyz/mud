import { Abi, type ContractFunctionName } from "viem";
import type IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json.d";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[],
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof IWorldCallAbi, "call">["inputs"]>[] {
  return systemCalls.map((systemCall) => encodeSystemCall({ ...systemCall, abi } as SystemCall<abi, functionName>));
}
