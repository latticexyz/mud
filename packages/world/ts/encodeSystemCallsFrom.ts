import { Abi, Address, GetFunctionArgs } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCallFrom, encodeSystemCallFrom } from "./encodeSystemCallFrom";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends string = string>(
  abi: abi,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[]
): GetFunctionArgs<typeof IWorldCallAbi, "callFrom">["args"][] {
  return systemCalls.map((systemCall) =>
    encodeSystemCallFrom({ ...systemCall, abi, from } as SystemCallFrom<abi, functionName>)
  );
}
