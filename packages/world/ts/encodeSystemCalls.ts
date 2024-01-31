import { Abi, GetFunctionArgs } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCall, encodeSystemCall } from "./encodeSystemCall";

/** Encode system calls to be passed as arguments into `World.batchCall` */
export function encodeSystemCalls<abi extends Abi, functionName extends string = string>(
  abi: abi,
  systemCalls: readonly Omit<SystemCall<abi, functionName>, "abi">[]
): GetFunctionArgs<typeof IWorldCallAbi, "call">["args"][] {
  return systemCalls.map((systemCall) => encodeSystemCall({ ...systemCall, abi } as SystemCall<abi, functionName>));
}
