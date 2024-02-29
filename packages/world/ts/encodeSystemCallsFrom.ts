import { Abi, Address, type ContractFunctionName } from "viem";
import IWorldCallAbi from "../out/IWorldKernel.sol/IWorldCall.abi.json";
import { SystemCallFrom, encodeSystemCallFrom } from "./encodeSystemCallFrom";
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";

/** Encode system calls to be passed as arguments into `World.batchCallFrom` */
export function encodeSystemCallsFrom<abi extends Abi, functionName extends ContractFunctionName<abi>>(
  abi: abi,
  from: Address,
  systemCalls: readonly Omit<SystemCallFrom<abi, functionName>, "abi" | "from">[]
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof IWorldCallAbi, "callFrom">["inputs"]>[] {
  return systemCalls.map((systemCall) =>
    encodeSystemCallFrom({ ...systemCall, abi, from } as SystemCallFrom<abi, functionName>)
  );
}
